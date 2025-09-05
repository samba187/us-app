import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiBookmark, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { noteService } from '../services/authService';

const NotesContainer = styled.div`
  padding: 20px;
  padding-bottom: 120px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
`;

const NoteCard = styled.div`
  background: ${props => props.pinned ? 'linear-gradient(135deg, #fff9c4, #ffeaa7)' : 'white'};
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
  position: relative;
  min-height: 120px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PinIcon = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  color: ${props => props.pinned ? '#f39c12' : 'var(--text-light)'};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const NoteContent = styled.div`
  margin-right: 30px;
  word-wrap: break-word;
  line-height: 1.5;
  color: var(--text-color);
`;

const NoteDate = styled.div`
  font-size: 12px;
  color: var(--text-light);
  margin-top: 15px;
`;

const NoteActions = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${NoteCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  transition: all 0.3s ease;

  &:hover {
    background: white;
    transform: scale(1.1);
  }

  &.delete {
    color: #e74c3c;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  margin-bottom: 20px;
  color: var(--text-color);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TextArea = styled.textarea`
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormOptions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-color);
  font-size: 14px;

  input {
    accent-color: var(--primary-color);
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
`;

const SecondaryButton = styled(Button)`
  background: var(--border-color);
  color: var(--text-color);
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
`;

function Notes() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    content: '',
    pinned: false
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await noteService.getAll();
      // Trier: épinglées d'abord, puis par date
      const sorted = data.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setNotes(sorted);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await noteService.update(editingNote._id, formData);
      } else {
        await noteService.create(formData);
      }
      setShowModal(false);
      setEditingNote(null);
      setFormData({ content: '', pinned: false });
      loadNotes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la note:', error);
    }
  };

  const togglePin = async (note) => {
    try {
      await noteService.update(note._id, { pinned: !note.pinned });
      loadNotes();
    } catch (error) {
      console.error('Erreur lors de l\'épinglage de la note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await noteService.delete(noteId);
        loadNotes();
      } catch (error) {
        console.error('Erreur lors de la suppression de la note:', error);
      }
    }
  };

  const editNote = (note) => {
    setEditingNote(note);
    setFormData({
      content: note.content,
      pinned: note.pinned
    });
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const openNewNote = () => {
    setEditingNote(null);
    setFormData({ content: '', pinned: false });
    setShowModal(true);
  };

  if (loading) {
    return (
      <NotesContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement des notes...
        </div>
      </NotesContainer>
    );
  }

  return (
    <NotesContainer className="fade-in">
      <Header>
        <Title>Notes</Title>
        <AddButton onClick={openNewNote}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      <NotesGrid>
        {notes.length > 0 ? (
          notes.map((note) => (
            <NoteCard key={note._id} pinned={note.pinned}>
              <PinIcon pinned={note.pinned} onClick={() => togglePin(note)}>
                <FiBookmark />
              </PinIcon>
              
              <NoteContent onClick={() => editNote(note)}>
                {note.content}
              </NoteContent>
              
              <NoteDate>{formatDate(note.created_at)}</NoteDate>
              
              <NoteActions>
                <ActionButton onClick={() => editNote(note)} title="Modifier">
                  <FiEdit2 />
                </ActionButton>
                <ActionButton 
                  className="delete" 
                  onClick={() => deleteNote(note._id)} 
                  title="Supprimer"
                >
                  <FiTrash2 />
                </ActionButton>
              </NoteActions>
            </NoteCard>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>📝</EmptyIcon>
            <h3>Aucune note pour le moment</h3>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Créez votre première note ou post-it ! ✨
            </p>
          </EmptyState>
        )}
      </NotesGrid>

      <Modal show={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>
            {editingNote ? 'Modifier la note' : 'Nouvelle note'}
          </ModalTitle>
          <Form onSubmit={handleSubmit}>
            <TextArea
              placeholder="Écrivez votre note ici..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
              autoFocus
            />
            
            <FormOptions>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({...formData, pinned: e.target.checked})}
                />
                  📌 Épingler cette note
                </Checkbox>
              </FormOptions>            <FormButtons>
              <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit">
                {editingNote ? 'Modifier' : 'Créer'}
              </PrimaryButton>
            </FormButtons>
          </Form>
        </ModalContent>
      </Modal>
    </NotesContainer>
  );
}

export default Notes;

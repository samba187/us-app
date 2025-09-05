import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FileText, Plus, Pin } from 'lucide-react'
import { noteService } from '../services/authService'

const Container = styled.div`
  padding: 120px 20px 20px;
  max-width: 1000px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
`

const AddButton = styled(motion.button)`
  background: var(--secondary-gradient);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`

const NoteCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  position: relative;
  min-height: 150px;
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  ${props => props.pinned && `
    border-left: 4px solid var(--warning-color);
    
    &::before {
      content: '';
      position: absolute;
      top: -1px;
      right: -1px;
      width: 20px;
      height: 20px;
      background: var(--warning-color);
      clip-path: polygon(0 0, 100% 0, 100% 100%);
    }
  `}
`

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 10px;
`

const NoteTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
`

const PinIcon = styled(motion.div)`
  color: ${props => props.pinned ? 'var(--warning-color)' : 'var(--text-muted)'};
  cursor: pointer;
  padding: 5px;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--warning-color);
  }
`

const NoteContent = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 15px;
  white-space: pre-wrap;
`

const NoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
`

const NoteDate = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`

const NoteAuthor = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`

function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await noteService.getAll()
      setNotes(response.notes || [])
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePin = async (noteId, currentPinned) => {
    try {
      await noteService.update(noteId, { pinned: !currentPinned })
      fetchNotes()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // Trier les notes : épinglées en premier, puis par date de création
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          Chargement des notes...
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          <FileText size={24} />
          Notes
        </Title>
        <AddButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Nouvelle note
        </AddButton>
      </Header>

      {notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'var(--bg-muted)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <FileText size={40} />
          </div>
          <h3>Aucune note</h3>
          <p>Créez votre première note partagée !</p>
        </motion.div>
      ) : (
        <NotesGrid>
          {sortedNotes.map((note, index) => (
            <NoteCard
              key={note._id}
              pinned={note.pinned}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <NoteHeader>
                <NoteTitle>{note.title || 'Note sans titre'}</NoteTitle>
                <PinIcon
                  pinned={note.pinned}
                  onClick={() => togglePin(note._id, note.pinned)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pin size={16} fill={note.pinned ? 'currentColor' : 'none'} />
                </PinIcon>
              </NoteHeader>

              <NoteContent>
                {truncateContent(note.content)}
              </NoteContent>

              <NoteMeta>
                <NoteDate>
                  📅 {formatDate(note.created_at)}
                </NoteDate>
                <NoteAuthor>
                  👤 {note.created_by_name || 'Anonyme'}
                </NoteAuthor>
              </NoteMeta>
            </NoteCard>
          ))}
        </NotesGrid>
      )}
    </Container>
  )
}

export default Notes

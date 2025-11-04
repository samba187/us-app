import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiPlus, FiTrash2, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';
import { authService } from '../services/authService';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
`;

const Container = styled.div`
  padding: 20px 16px;
  max-width: 800px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 16px 12px; }
`;

const Title = styled.h1`
  margin: 0 0 20px 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease-out;

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  &::placeholder {
    color: var(--muted-text);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  &::placeholder {
    color: var(--muted-text);
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  option {
    background: #1a1d2e;
    color: var(--text-color);
    padding: 10px;
  }

  option:checked {
    background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
    color: #fff;
  }
`;

const Button = styled.button`
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ReminderCard = styled(Card)`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  border-left: 4px solid ${p => 
    p.priority === 'urgent' ? '#e74c3c' : 
    p.priority === 'important' ? '#f39c12' : 
    '#3498db'
  };
`;

const Checkbox = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${p => p.checked ? 'var(--neon-1)' : 'rgba(255,255,255,0.3)'};
  background: ${p => p.checked ? 'var(--neon-1)' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: var(--neon-1);
  }
`;

const ReminderContent = styled.div`
  flex: 1;
`;

const ReminderTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 6px;
  text-decoration: ${p => p.done ? 'line-through' : 'none'};
  opacity: ${p => p.done ? 0.6 : 1};
`;

const ReminderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--muted-text);
  margin-bottom: 8px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  background: ${p => 
    p.type === 'urgent' ? 'rgba(231, 76, 60, 0.15)' : 
    p.type === 'important' ? 'rgba(243, 156, 18, 0.15)' : 
    'rgba(52, 152, 219, 0.15)'
  };
  color: ${p => 
    p.type === 'urgent' ? '#e74c3c' : 
    p.type === 'important' ? '#f39c12' : 
    '#3498db'
  };
  font-weight: 500;
`;

const Description = styled.div`
  font-size: 14px;
  color: var(--muted-text);
  line-height: 1.5;
  margin-bottom: 10px;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  border: 1px solid rgba(231, 76, 60, 0.5);
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(231, 76, 60, 0.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--muted-text);
`;

export default function Reminders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await authService.api.get('/api/reminders');
      setItems(r.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const add = async () => {
    if (!title.trim()) return;
    try {
      await authService.api.post('/api/reminders', {
        title,
        description,
        due_date: dueDate || null,
        priority
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('normal');
      await load();
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  };

  const toggle = async (id, status) => {
    try {
      await authService.api.put(`/api/reminders/${id}`, {
        status: status === 'pending' ? 'done' : 'pending'
      });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce rappel ?')) return;
    try {
      await authService.api.delete(`/api/reminders/${id}`);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return null;
    }
  };

  return (
    <Container>
      <Title>Rappels</Title>

      <Card>
        <FormGrid>
          <Input
            placeholder="Titre du rappel *"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <TextArea
            placeholder="Description (optionnel)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Row>
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <Select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Row>
          <Button onClick={add}>
            <FiPlus /> Ajouter
          </Button>
        </FormGrid>
      </Card>

      {loading ? (
        <>
          <div className="skeleton" style={{ height: 120, borderRadius: 18, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 18 }} />
        </>
      ) : items.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: 48, marginBottom: 12 }}><FiClock /></div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun rappel</div>
          <div>Ajoutez votre premier rappel ci-dessus</div>
        </EmptyState>
      ) : (
        items.map(it => (
          <ReminderCard key={it._id} priority={it.priority}>
            <Checkbox
              checked={it.status === 'done'}
              onClick={() => toggle(it._id, it.status)}
            >
              {it.status === 'done' && <FiCheck size={16} />}
            </Checkbox>
            <ReminderContent>
              <ReminderTitle done={it.status === 'done'}>{it.title}</ReminderTitle>
              <ReminderMeta>
                <Badge type={it.priority}>
                  <FiAlertCircle size={12} />
                  {it.priority}
                </Badge>
                {it.due_date && formatDate(it.due_date) && (
                  <span>
                    <FiClock size={12} style={{ marginRight: 4 }} />
                    {formatDate(it.due_date)}
                  </span>
                )}
              </ReminderMeta>
              {it.description && <Description>{it.description}</Description>}
              <DeleteButton onClick={() => remove(it._id)}>
                <FiTrash2 size={14} /> Supprimer
              </DeleteButton>
            </ReminderContent>
          </ReminderCard>
        ))
      )}
    </Container>
  );
}

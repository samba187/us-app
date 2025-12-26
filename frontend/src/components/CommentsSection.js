import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';
import { FiSend, FiTrash2 } from 'react-icons/fi';

const Container = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-color);
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const CommentItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  position: relative;
`;

const CommentMeta = styled.div`
  font-size: 11px;
  color: var(--muted-text);
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
`;

const CommentContent = styled.div`
  color: var(--text-color);
  white-space: pre-wrap;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  &:focus { outline: none; border-color: var(--primary-color); }
`;

const SendBtn = styled.button`
  background: var(--primary-color);
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export default function CommentsSection({ targetType, targetId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState(null);

  useEffect(() => {
    load();
    authService.api.get('/api/me').then(r => setMe(r.data)).catch(()=>{});
  }, [targetId]);

  const load = async () => {
    try {
      const res = await authService.api.get(`/api/comments?target_type=${targetType}&target_id=${targetId}`);
      setComments(res.data);
    } catch (e) { console.error(e); }
  };

  const send = async () => {
    if (!text.trim()) return;
    try {
      await authService.api.post('/api/comments', { target_type: targetType, target_id: targetId, content: text });
      setText('');
      load();
    } catch (e) { console.error(e); }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    try {
      await authService.api.delete(`/api/comments/${id}`);
      load();
    } catch (e) { console.error(e); }
  };

  return (
    <Container>
      <Title>Commentaires ({comments.length})</Title>
      <CommentList>
        {comments.map(c => (
          <CommentItem key={c._id}>
            <CommentMeta>
              <span>{c.created_by === me?.id ? 'Moi' : 'Partenaire'} • {new Date(c.created_at).toLocaleDateString()}</span>
              {c.created_by === me?.id && <DeleteBtn onClick={() => remove(c._id)}><FiTrash2 /></DeleteBtn>}
            </CommentMeta>
            <CommentContent>{c.content}</CommentContent>
          </CommentItem>
        ))}
      </CommentList>
      <InputGroup>
        <Input 
          placeholder="Écrire un commentaire..." 
          value={text} 
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <SendBtn onClick={send}><FiSend /></SendBtn>
      </InputGroup>
    </Container>
  );
}

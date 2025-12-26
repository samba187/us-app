import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const EmojiBtn = styled.button`
  background: ${p => p.active ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${p => p.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  padding: 4px 10px;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AddReactionBtn = styled.button`
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 4px 10px;
  color: var(--muted-text);
  cursor: pointer;
  font-size: 12px;
  &:hover { border-color: var(--text-color); color: var(--text-color); }
`;

const EMOJIS = ['❤️', '👍', '🔥', '😂', '😮', '😢'];

export default function ReactionsBar({ targetType, targetId }) {
  const [reactions, setReactions] = useState([]);
  const [me, setMe] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    load();
    authService.api.get('/api/me').then(r => setMe(r.data)).catch(()=>{});
  }, [targetId]);

  const load = async () => {
    try {
      const res = await authService.api.get(`/api/reactions?target_type=${targetType}&target_id=${targetId}`);
      setReactions(res.data);
    } catch (e) { console.error(e); }
  };

  const toggle = async (emoji) => {
    try {
      await authService.api.post('/api/reactions', { target_type: targetType, target_id: targetId, emoji });
      load();
      setShowPicker(false);
    } catch (e) { console.error(e); }
  };

  // Group reactions by emoji
  const counts = {};
  reactions.forEach(r => {
    if (!counts[r.emoji]) counts[r.emoji] = { count: 0, active: false };
    counts[r.emoji].count++;
    if (r.created_by === me?.id) counts[r.emoji].active = true;
  });

  return (
    <Container>
      {Object.entries(counts).map(([emoji, data]) => (
        <EmojiBtn key={emoji} active={data.active} onClick={() => toggle(emoji)}>
          {emoji} {data.count}
        </EmojiBtn>
      ))}
      
      <div style={{position: 'relative'}}>
        <AddReactionBtn onClick={() => setShowPicker(!showPicker)}>+ Réagir</AddReactionBtn>
        {showPicker && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
            background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 8, display: 'flex', gap: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10
          }}>
            {EMOJIS.map(e => (
              <button 
                key={e} 
                onClick={() => toggle(e)}
                style={{background:'none', border:'none', fontSize:20, cursor:'pointer', padding:4}}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

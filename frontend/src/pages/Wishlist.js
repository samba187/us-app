import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiHeart, FiExternalLink } from 'react-icons/fi';
import { wishlistService } from '../services/authService';

const WishlistContainer = styled.div`
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

const WishlistCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 15px;
  overflow: hidden;
`;

const WishlistImage = styled.div`
  height: 120px;
  background: ${props => props.image ? `url(${props.image})` : 'linear-gradient(135deg, #f093fb, #f5576c)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WishlistIcon = styled.div`
  font-size: 48px;
  color: white;
  opacity: 0.8;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'idea': return 'rgba(255, 165, 2, 0.9)';
      case 'bought': return 'rgba(46, 213, 115, 0.9)';
      case 'gifted': return 'rgba(255, 107, 138, 0.9)';
      default: return 'rgba(0, 0, 0, 0.7)';
    }
  }};
  color: white;
`;

const WishlistContent = styled.div`
  padding: 20px;
`;

const WishlistTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
`;

const ForUser = styled.p`
  color: var(--primary-color);
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
`;

const WishlistDescription = styled.p`
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 15px;
`;

const WishlistActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-color);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--background-color);
  }

  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
`;

const LinkButton = styled.a`
  padding: 8px 12px;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background: white;
  color: var(--primary-color);
  font-size: 12px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await wishlistService.getAll();
      setWishlist(data);
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await wishlistService.update(id, { status: newStatus });
      loadWishlist();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'item:', error);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'idea': return 'Idée';
      case 'bought': return 'Acheté';
      case 'gifted': return 'Offert';
      default: return status;
    }
  };

  const getUserName = (userId) => {
    // Dans une vraie app, on récupérerait le nom depuis la base
    return userId === 'user1' ? 'Toi' : 'Ta copine';
  };

  if (loading) {
    return (
      <WishlistContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement de la wishlist...
        </div>
      </WishlistContainer>
    );
  }

  return (
    <WishlistContainer className="fade-in">
      <Header>
        <Title>Wishlist</Title>
        <AddButton>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      {wishlist.map((item) => (
        <WishlistCard key={item._id}>
          <WishlistImage image={item.image_url}>
            {!item.image_url && (
              <WishlistIcon>🎁</WishlistIcon>
            )}
            <StatusBadge status={item.status}>
              {getStatusLabel(item.status)}
            </StatusBadge>
          </WishlistImage>
          
          <WishlistContent>
            <WishlistTitle>{item.title}</WishlistTitle>
            <ForUser>💝 Pour {getUserName(item.for_user)}</ForUser>
            
            {item.description && (
              <WishlistDescription>{item.description}</WishlistDescription>
            )}
            
            <WishlistActions>
              <ActionButton
                className={item.status === 'idea' ? 'active' : ''}
                onClick={() => updateStatus(item._id, 'idea')}
              >
                Idée
              </ActionButton>
              <ActionButton
                className={item.status === 'bought' ? 'active' : ''}
                onClick={() => updateStatus(item._id, 'bought')}
              >
                Acheté
              </ActionButton>
              <ActionButton
                className={item.status === 'gifted' ? 'active' : ''}
                onClick={() => updateStatus(item._id, 'gifted')}
              >
                Offert
              </ActionButton>
              
              {item.link_url && (
                <LinkButton href={item.link_url} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink /> Voir
                </LinkButton>
              )}
            </WishlistActions>
          </WishlistContent>
        </WishlistCard>
      ))}

      {wishlist.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          <FiHeart size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
          <p>Aucune idée cadeau pour le moment</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Ajoutez vos envies et idées cadeaux ! 🎁
          </p>
        </div>
      )}
    </WishlistContainer>
  );
}

export default Wishlist;

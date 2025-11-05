<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiMoon, FiSun, FiLogOut, FiUsers, FiImage, FiUpload, FiX, FiCheck } from 'react-icons/fi';
=======
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiMoon, FiSun, FiLogOut, FiUsers } from 'react-icons/fi';
>>>>>>> 8435e37dedd427f4484f92ef50a73d45c7720fcc
import NotificationSettings from '../components/NotificationSettings';
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

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Label = styled.div`
  flex: 1;
`;

const LabelTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color);
  margin-bottom: 4px;
`;

const LabelSubtitle = styled.div`
  opacity: 0.8;
  font-size: 13px;
  color: var(--muted-text);
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-color);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }

<<<<<<< HEAD
  option {
    background: #1a1d2e;
    color: var(--text-color);
    padding: 10px;
  }

  option:checked {
    background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
    color: #fff;
  }

=======
>>>>>>> 8435e37dedd427f4484f92ef50a73d45c7720fcc
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Button = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(124, 58, 237, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  box-shadow: 0 4px 14px rgba(231, 76, 60, 0.3);

  &:hover {
    box-shadow: 0 6px 18px rgba(231, 76, 60, 0.4);
  }
`;

const CoupleInfo = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  margin-top: 12px;
`;

const CodeBadge = styled.code`
  display: inline-block;
  padding: 6px 12px;
  background: rgba(124, 58, 237, 0.15);
  border-radius: 8px;
  color: var(--neon-1);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
`;
<<<<<<< HEAD

const AvatarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  background: ${({src}) => src ? `url(${src}) center/cover no-repeat` : 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(255,107,138,0.4))'};
`;

const SmallButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-color);
  cursor: pointer;
  transition: all .2s ease;
  display: inline-flex; align-items: center; gap: 8px;
  &:hover { background: rgba(255,255,255,0.09); }
`;

const Modal = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.85);
  display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px;
`;
const ModalCard = styled.div`
  width: 100%; max-width: 620px; border-radius: 18px; overflow:hidden;
  background: rgba(15, 18, 33, 0.98);
  border:1px solid rgba(255,255,255,0.12);
`;
const ModalHeader = styled.div`
  display:flex; align-items:center; justify-content:space-between; padding:16px 20px;
  border-bottom:1px solid rgba(255,255,255,0.08);
`;
const ModalBody = styled.div`
  padding: 16px 20px; display:flex; flex-direction:column; gap:16px;
`;
const FileBox = styled.label`
  border:2px dashed rgba(255,255,255,0.15); border-radius:14px; padding:20px; text-align:center; cursor:pointer;
  background: rgba(255,255,255,0.03);
`;
const HiddenInput = styled.input`
  display:none;
`;
const AvatarGrid = styled.div`
  display:grid; grid-template-columns: repeat(auto-fill, minmax(80px,1fr)); gap:12px;
`;
const AvatarOption = styled.button`
  width:100%; padding-top:100%; position:relative; border:none; border-radius:14px; cursor:pointer; overflow:hidden;
  background: #111;
  &:after{ content:''; position:absolute; inset:0; background:${({src})=>`url(${src}) center/cover no-repeat`}; }
  &.active { outline: 3px solid var(--neon-1); }
`;
=======
>>>>>>> 8435e37dedd427f4484f92ef50a73d45c7720fcc

export default function Profile() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [couple, setCouple] = useState(null);
  const [me, setMe] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const absoluteUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const presetAvatars = useMemo(() => {
    const seeds = ['Nova','Luna','Orion','Vega','Atlas','Iris','Cosmo','Milo','Nora','Rex','Zoe','Leo'];
    return seeds.map(s => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s)}&backgroundColor=transparent`);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await authService.api.get('/api/couple/me');
        setCouple(r.data);
<<<<<<< HEAD
        const meRes = await authService.me.get();
        setMe(meRes);
=======
>>>>>>> 8435e37dedd427f4484f92ef50a73d45c7720fcc
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : 'light');
  };

  const onLangChange = (e) => {
    const v = e.target.value;
    setLang(v);
    localStorage.setItem('lang', v);
  };

  const logout = () => {
    authService.clearToken();
    window.location.reload();
  };

  const openAvatarModal = () => { setShowAvatarModal(true); setUploadFile(null); setUploadPreview(null); };
  const closeAvatarModal = () => { setShowAvatarModal(false); setUploadFile(null); setUploadPreview(null); };
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadFile(f);
    const rd = new FileReader();
    rd.onload = (ev) => setUploadPreview(ev.target.result);
    rd.readAsDataURL(f);
  };
  const saveUploadedAvatar = async () => {
    if (!uploadFile) return;
    try {
      const res = await authService.me.uploadAvatar(uploadFile);
      setMe(m => ({...m, avatar_url: res.avatar_url}));
      closeAvatarModal();
    } catch (e) { alert("Échec de l'upload"); }
  };
  const choosePreset = async (url) => {
    try {
      await authService.me.update({ avatar_url: url });
      setMe(m => ({...m, avatar_url: url}));
      closeAvatarModal();
    } catch (e) { alert('Impossible de mettre à jour'); }
  };
  const removeAvatar = async () => {
    try {
      await authService.me.update({ avatar_url: '' });
      setMe(m => ({...m, avatar_url: ''}));
    } catch (e) {}
  };

  return (
    <Container>
      <Title>Profil</Title>

      <Card>
<<<<<<< HEAD
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <AvatarWrap>
            <Avatar src={absoluteUrl(me?.avatar_url)} />
            <div>
              <LabelTitle>Photo de profil</LabelTitle>
              <LabelSubtitle>Utilisez votre photo ou un avatar stylé</LabelSubtitle>
            </div>
          </AvatarWrap>
          <div style={{display:'flex', gap:8}}>
            <SmallButton onClick={openAvatarModal}><FiImage /> Changer</SmallButton>
            {me?.avatar_url ? (
              <SmallButton onClick={removeAvatar}><FiX /> Retirer</SmallButton>
            ) : null}
          </div>
        </div>
      </Card>

      {showAvatarModal && (
        <Modal onClick={(e)=> e.target===e.currentTarget && closeAvatarModal()}>
          <ModalCard>
            <ModalHeader>
              <LabelTitle>Mettre à jour l'avatar</LabelTitle>
              <SmallButton onClick={closeAvatarModal}><FiX /></SmallButton>
            </ModalHeader>
            <ModalBody>
              <div>
                <LabelTitle>Uploader une photo</LabelTitle>
                <FileBox>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                    <FiUpload />
                    <div>Sélectionner une image</div>
                  </div>
                  <HiddenInput type="file" accept="image/*" onChange={onFile} />
                </FileBox>
                {uploadPreview && (
                  <div style={{display:'flex', alignItems:'center', gap:12, marginTop:12}}>
                    <Avatar src={uploadPreview} />
                    <Button onClick={saveUploadedAvatar}><FiCheck /> Enregistrer</Button>
                  </div>
                )}
              </div>
              <div>
                <LabelTitle>Ou choisissez un avatar</LabelTitle>
                <AvatarGrid>
                  {presetAvatars.map((u,i)=> (
                    <AvatarOption key={i} src={u} className={me?.avatar_url===u ? 'active' : ''} onClick={()=>choosePreset(u)} />
                  ))}
                </AvatarGrid>
              </div>
            </ModalBody>
          </ModalCard>
        </Modal>
      )}
      <Card>
=======
>>>>>>> 8435e37dedd427f4484f92ef50a73d45c7720fcc
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <FiUsers size={20} color="var(--neon-1)" />
          <LabelTitle>Couple</LabelTitle>
        </div>
        {couple?.in_couple ? (
          <CoupleInfo>
            <div style={{ marginBottom: 8 }}>
              <strong>Code d'invitation:</strong> <CodeBadge>{couple.invite_code || '—'}</CodeBadge>
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Membres:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                {(couple.members || []).map(m => (
                  <li key={m.id} style={{ marginBottom: 4 }}>
                    {m.name} — {m.email}
                  </li>
                ))}
              </ul>
            </div>
          </CoupleInfo>
        ) : (
          <div style={{ color: 'var(--muted-text)', fontSize: 14 }}>
            Vous n'êtes pas encore lié(e) — allez dans « Couple » pour créer/rejoindre.
          </div>
        )}
      </Card>

      <Card>
        <Row>
          <Label>
            <LabelTitle>Langue</LabelTitle>
            <LabelSubtitle>Choisissez votre langue d'interface</LabelSubtitle>
          </Label>
          <Select value={lang} onChange={onLangChange}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Select>
        </Row>
      </Card>

      <Card>
        <Row>
          <Label>
            <LabelTitle>Apparence</LabelTitle>
            <LabelSubtitle>Mode {theme === 'dark' ? 'sombre' : 'clair'}</LabelSubtitle>
          </Label>
          <Button onClick={toggleTheme}>
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
            Basculer
          </Button>
        </Row>
      </Card>

      <NotificationSettings />

      <Card>
        <Row>
          <Label>
            <LabelTitle>Déconnexion</LabelTitle>
            <LabelSubtitle>Se déconnecter de ce dispositif</LabelSubtitle>
          </Label>
          <DangerButton onClick={logout}>
            <FiLogOut /> Se déconnecter
          </DangerButton>
        </Row>
      </Card>
    </Container>
  );
}

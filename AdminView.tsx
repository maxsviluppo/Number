import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';

const AdminView: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Amministrazione | Number Game';
  }, []);

  const handleClose = () => {
    navigate('/site');
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <AdminPanel onClose={handleClose} />
    </div>
  );
};

export default AdminView;

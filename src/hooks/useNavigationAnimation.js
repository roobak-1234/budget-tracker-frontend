import { useNavigate } from 'react-router-dom';

export const useNavigationAnimation = () => {
  const navigate = useNavigate();

  const navigateWithAnimation = (path) => {
    navigate(path);
  };

  return { navigateWithAnimation };
};
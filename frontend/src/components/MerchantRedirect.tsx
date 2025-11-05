import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MerchantRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/business/${id}`, { replace: true });
    }
  }, [id, navigate]);

  return null;
};

export default MerchantRedirect;

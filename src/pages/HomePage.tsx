import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Image, Alert } from 'react-bootstrap';

import qrCodeImage from '../assets/qr-code.png';

interface HomePageProps {
  setDonorData: (data: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setDonorData }) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Gán qrScanner cho qrScannerRef.current
    qrScannerRef.current = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    if (qrScannerRef.current) {
      qrScannerRef.current.render(
        (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          setErrorMessage(null);
          navigate('/form');
        },
        (error: Error) => {
          if (error.message.includes('NotFoundException')) {
            setErrorMessage('Hình ảnh không chứa mã QR Code. Vui lòng chọn hình ảnh khác hoặc thử lại!');
          } else {
            setErrorMessage('Đã có lỗi xảy ra khi quét mã QR Code. Vui lòng thử lại!');
          }
          console.error('QR Code scan error:', error);
        }
      );
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear();
      }
    };
  }, [navigate]);

  // Hàm để thử lại (khởi động lại quét QR Code)
  const handleRetry = () => {
    setErrorMessage(null);
    if (qrScannerRef.current) {
      qrScannerRef.current.render(
        (decodedText: string) => {
          // Tạo hàm async riêng để xử lý fetch
          const fetchDonorData = async () => {
            try {
              const response = await fetch(`${process.env.REACT_APP_API_URL}/api/donor/${decodedText}`);
              if (!response.ok) {
              throw new Error(`Failed to fetch donor data: ${response.status} ${response.statusText}`);
              }
              const data = await response.json();
              setDonorData(data);
              navigate('/form');
            } catch (error) {
              console.error('Error fetching donor data:', error);
              setErrorMessage('Không thể lấy dữ liệu người hiến máu. Vui lòng nhập tay thông tin.');
              navigate('/form');
            }
          };

          fetchDonorData();
        },
        (error: Error) => {
          if (error.message.includes('NotFoundException')) {
            setErrorMessage('Hình ảnh không chứa mã QR Code. Vui lòng chọn hình ảnh khác hoặc thử lại!');
          } else {
            setErrorMessage('Đã có lỗi xảy ra khi quét mã QR Code. Vui lòng thử lại!');
          }
          console.error('QR Code scan error:', error);
        }
      );
    }
  };

  return (
    <Container className="text-center">
      <h1>Quét QR Code</h1>
      <div id="qr-reader" style={{ width: '100%' }}></div>

      {/* Hiển thị thông báo lỗi nếu có */}
      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
          <div className="mt-2">
            <Button variant="primary" onClick={handleRetry} className="me-2">
              Thử lại
            </Button>
            <Button variant="secondary" onClick={() => navigate('/form')}>
              Nhập tay thông tin
            </Button>
          </div>
        </Alert>
      )}

      <p>Hoặc quét mã QR dưới đây để đăng ký hiến máu:</p>
      <Image src={qrCodeImage} alt="QR Code để đăng ký hiến máu" style={{ width: '200px', margin: '20px 0' }} />
      <Button variant="secondary" className="mt-3" onClick={() => navigate('/form')}>
        Nhập tay thông tin
      </Button>
    </Container>
  );
};

export default HomePage;
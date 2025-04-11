import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';

interface HomePageProps {
  setDonorData: (data: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setDonorData }) => {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const html5QrCodeScanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });
    setScanner(html5QrCodeScanner);

    const onScanSuccess = (decodedText: string) => {
      console.log(`QR Code scanned: ${decodedText}`);
      // Kiểm tra nếu decodedText là URL, trích xuất donorId
      const url = new URL(decodedText);
      const donorId = url.pathname.split('/').pop(); // Lấy donorId từ URL
      if (donorId) {
        setDonorData({ id: donorId });
        navigate(`/donor/${donorId}`);
      }
    };

    const onScanFailure = (error: string) => {
      console.warn(`QR Code scan error: ${error}`);
    };

    html5QrCodeScanner.render(onScanSuccess, onScanFailure);

    return () => {
      html5QrCodeScanner.clear();
    };
  }, [navigate, setDonorData]);

  const handleManualEntry = () => {
    setDonorData(null);
    navigate('/donor/new');
  };

  // Giả lập donorId cho QR code (có thể thay bằng giá trị động)
  const donorId = '12345';
  // Sử dụng base URL từ biến môi trường
  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3001';
  const qrCodeValue = `${baseUrl}/donor/${donorId}`; // URL đầy đủ: http://localhost:3001/donor/12345

  return (
    <Container className="text-center">
      <h1>Quét QR Code</h1>
      <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      <p>Hoặc quét mã QR dưới đây để đăng ký hiến máu:</p>
      <div style={{ margin: '20px 0' }}>
        <QRCodeSVG
          value={qrCodeValue}
          size={200}
          fgColor="#000000"
          bgColor="#ffffff"
          level="H"
          style={{ border: '2px solid red', padding: '10px' }}
        />
      </div>
      <Button variant="danger" style={{ marginBottom: '20px' }}>
        Scan Me
      </Button>
      <div>
        <Button variant="secondary" onClick={handleManualEntry}>
          Nhập tay thông tin
        </Button>
      </div>
    </Container>
  );
};

export default HomePage;
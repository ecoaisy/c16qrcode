import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface ConfirmationPageProps {
  donorData: any;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ donorData }) => {
  const navigate = useNavigate();

  return (
    <Container className="text-center">
      <h2>Xác nhận thông tin</h2>
      <Card className="mt-3">
        <Card.Body>
          <Card.Title>Thông tin người hiến máu</Card.Title>
          <Card.Text>Họ và tên: {donorData.fullName}</Card.Text>
          <Card.Text>Địa chỉ: {donorData.address}</Card.Text>
          <Card.Text>Số điện thoại: {donorData.phone}</Card.Text>
          <Card.Text>Email: {donorData.email}</Card.Text>
          <Card.Text>Nhóm máu: {donorData.bloodType}</Card.Text>
          <Card.Text>Bệnh lý: {donorData.diseases.join(', ')}</Card.Text>
          <Card.Text>Số lần hiến máu: {donorData.donationCount}</Card.Text>
          <Card.Text>Ngày hiến máu cuối: {new Date(donorData.lastDonationDate).toLocaleString()}</Card.Text>
          <img src={donorData.signature} alt="Chữ ký" style={{ maxWidth: '200px' }} />
        </Card.Body>
      </Card>
      <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
        Quay lại
      </Button>
    </Container>
  );
};

export default ConfirmationPage;
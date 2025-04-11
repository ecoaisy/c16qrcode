import React, { useState, useRef } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate, useParams } from 'react-router-dom';

interface FormPageProps {
  donorData: any;
  setDonorData: (data: any) => void;
}

const FormPage: React.FC<FormPageProps> = ({ donorData, setDonorData }) => {
  const navigate = useNavigate();
  const { donorId } = useParams(); // Lấy donorId từ URL (ví dụ: /donor/12345)
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [formData, setFormData] = useState({
    fullName: donorData?.fullName || '',
    address: donorData?.address || '',
    phone: donorData?.phone || '',
    email: donorData?.email || '',
    bloodType: donorData?.bloodType || '',
    diseases: donorData?.diseases || [],
    donationCount: donorData?.donationCount || 0,
    lastDonationDate: donorData?.lastDonationDate || '',
    location: '', // Thêm trường location
    amount: '', // Thêm trường amount
  });
  const [error, setError] = useState<string | null>(null); // Thêm state để hiển thị lỗi

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDiseasesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, diseases: [...formData.diseases, value] });
    } else {
      setFormData({ ...formData, diseases: formData.diseases.filter((d: string) => d !== value) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset lỗi trước khi gửi

    const signature = sigCanvas.current?.toDataURL();
    const lastDonationDate = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dạng YYYY-MM-DD
    const updatedData = {
      ...formData,
      donationCount: donorData ? formData.donationCount + 1 : 1,
      lastDonationDate,
      signature,
    };

    // Kiểm tra dữ liệu trước khi gửi
    if (!formData.location || !formData.amount) {
      setError('Vui lòng nhập địa điểm và lượng máu hiến.');
      return;
    }

    // Gửi yêu cầu POST đến backend
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/donor/${donorId}/donation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: lastDonationDate,
            location: formData.location,
            amount: formData.amount,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Không thể lưu thông tin hiến máu.');
      }

      // Nếu lưu thành công, cập nhật donorData và điều hướng
      setDonorData(updatedData);
      navigate('/confirmation');
    } catch (err: any) {
      setError(err.message);
      console.error('Error submitting donation:', err);
    }
  };

  return (
    <Container>
      <h2>{donorData ? 'Cập nhật thông tin' : 'Nhập thông tin hiến máu'}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Nhóm máu</Form.Label>
          <Form.Select name="bloodType" value={formData.bloodType} onChange={handleChange} required>
            <option value="">Chọn nhóm máu</option>
            <option value="A+">A+ Nhóm A, Rh dương tính</option>
            <option value="A-">A- Nhóm A, Rh âm tính</option>
            <option value="B+">B+ Nhóm B, Rh dương tính</option>
            <option value="B-">B- Nhóm B, Rh âm tính</option>
            <option value="AB+">AB+ Nhóm AB, Rh dương tính</option>
            <option value="AB-">AB- Nhóm AB, Rh âm tính</option>
            <option value="O+">O+ Nhóm O, RH dương tính</option>
            <option value="O-">O- Nhóm O, RH âm tính</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Bệnh lý liên quan</Form.Label>
          <Form.Check
            type="checkbox"
            label="Viêm gan"
            value="Viêm gan"
            onChange={handleDiseasesChange}
          />
          <Form.Check
            type="checkbox"
            label="Lao"
            value="Lao"
            onChange={handleDiseasesChange}
          />
          <Form.Check
            type="checkbox"
            label="Ung thư"
            value="Ung thư"
            onChange={handleDiseasesChange}
          />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Địa điểm hiến máu</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Lượng máu hiến (ml)</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Chữ ký điện tử</Form.Label>
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{ className: 'signature-canvas', width: 300, height: 150 }}
          />
          <Button variant="secondary" onClick={() => sigCanvas.current?.clear()}>
            Xóa chữ ký
          </Button>
        </Form.Group>
        <Button variant="primary" type="submit">
          Xác nhận và gửi
        </Button>
      </Form>
    </Container>
  );
};

export default FormPage;
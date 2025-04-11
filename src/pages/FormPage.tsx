import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface FormPageProps {
  donorData: any;
  setDonorData: (data: any) => void;
}

const FormPage: React.FC<FormPageProps> = ({ donorData, setDonorData }) => {
  const navigate = useNavigate();
  const { donorId } = useParams();
  const location = useLocation();
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
    location: '',
    amount: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isNewDonor, setIsNewDonor] = useState(donorId === 'new');

  // Lấy dữ liệu từ backend nếu donorId không phải là 'new'
  useEffect(() => {
    const fetchDonorData = async () => {
      if (donorId && donorId !== 'new') {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/donor/${donorId}`
          );
          const data = await response.json();
          if (response.ok) {
            setFormData({
              fullName: data.name || '',
              address: data.address || '',
              phone: data.phone || '',
              email: data.email || '',
              bloodType: data.bloodType || '',
              diseases: data.diseases || [],
              donationCount: data.donationCount || 0,
              lastDonationDate: data.lastDonationDate || '',
              location: '',
              amount: '',
            });
            setDonorData(data);
          } else {
            setError('Không tìm thấy thông tin người hiến máu.');
          }
        } catch (err: any) {
          setError('Lỗi khi lấy thông tin người hiến máu.');
          console.error('Error fetching donor data:', err);
        }
      }
    };

    fetchDonorData();
  }, [donorId, setDonorData]);

  useEffect(() => {
    console.log('Current URL:', location.pathname);
    console.log('donorId from useParams:', donorId);
  }, [location, donorId]);

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
      setFormData({
        ...formData,
        diseases: formData.diseases.filter((d: string) => d !== value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Nếu là donor mới, cần gửi thông tin donor lên backend trước
    let currentDonorId = donorId;
    if (isNewDonor) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/donor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: `donor_${Date.now()}`, // Tạo ID tạm thời
            fullName: formData.fullName,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            bloodType: formData.bloodType,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Không thể lưu thông tin người hiến máu.');
        }

        currentDonorId = result.donor.id;
        setDonorData(result.donor);
      } catch (err: any) {
        setError(err.message);
        console.error('Error creating new donor:', err);
        return;
      }
    }

    if (!currentDonorId || currentDonorId === 'new') {
      setError('Không tìm thấy ID người hiến máu.');
      return;
    }

    const signature = sigCanvas.current?.toDataURL();
    const lastDonationDate = new Date().toISOString().split('T')[0];
    const updatedData = {
      ...formData,
      donationCount: donorData ? formData.donationCount + 1 : 1,
      lastDonationDate,
      signature,
    };

    if (!formData.location || !formData.amount) {
      setError('Vui lòng nhập địa điểm và lượng máu hiến.');
      return;
    }

    const postData = {
      date: lastDonationDate,
      location: formData.location,
      amount: formData.amount,
    };
    console.log('Sending POST data:', { donorId: currentDonorId, ...postData });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/donor/${currentDonorId}/donation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Không thể lưu thông tin hiến máu.');
      }

      setDonorData(updatedData);
      navigate('/confirmation');
    } catch (err: any) {
      setError(err.message);
      console.error('Error submitting donation:', err);
    }
  };

  return (
    <Container>
      <h2>{isNewDonor ? 'Nhập thông tin hiến máu' : 'Cập nhật thông tin'}</h2>
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
          <Form.Select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            required
          >
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
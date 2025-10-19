import styled from 'styled-components';

export const ContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  padding: 80px 0;

  @media screen and (max-width: 768px) {
    padding: 60px 0;
  }
`;

export const ContactWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;
`;

export const ContactHeading = styled.h1`
  margin-bottom: 24px;
  font-size: 48px;
  line-height: 1.1;
  font-weight: 600;
  color: #1c2237;

  @media screen and (max-width: 768px) {
    font-size: 32px;
  }
`;

export const ContactSubtitle = styled.p`
  max-width: 600px;
  margin-bottom: 35px;
  font-size: 18px;
  line-height: 24px;
  color: #1c2237;
  text-align: center;
`;

export const FormWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormLabel = styled.label`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1c2237;
`;

export const FormInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4b59f7;
    box-shadow: 0 0 0 3px rgba(75, 89, 247, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;

export const FormTextarea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 16px;
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4b59f7;
    box-shadow: 0 0 0 3px rgba(75, 89, 247, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;

export const FormButton = styled.button`
  background: linear-gradient(
    135deg,
    rgb(24, 138, 226) 0%,
    rgb(110, 103, 232) 100%
  );
  padding: 14px 32px;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(110, 103, 232, 0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SuccessMessage = styled.div`
  padding: 16px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
  color: #155724;
  text-align: center;
  margin-top: 20px;
`;

export const ErrorMessage = styled.div`
  padding: 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  color: #721c24;
  text-align: center;
  margin-top: 20px;
`;

export const RequiredStar = styled.span`
  color: #e74c3c;
  margin-left: 4px;
`;

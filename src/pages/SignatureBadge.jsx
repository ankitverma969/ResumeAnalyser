import signatureImg from "../assets/sign-AnkitVerma.png"// put your image inside assets folder
import '../styles/SignatureBadge.css';

const SignatureBadge = () => {
  return (
    <div className="signature-badge">
      <span className="signature-text">Project Designed By</span>
      <img src={signatureImg} alt="signature" className="signature-img" />
    </div>
  );
};

export default SignatureBadge;
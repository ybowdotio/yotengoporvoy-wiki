/* Form Styles */
.upload-form,
.write-form,
.record-form {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 253, 240, 0.9);
  border: 1px solid #8B7355;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c1810;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="date"],
.form-group input[type="file"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #8B7355;
  background: #FFFDF0;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group select {
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
  width: auto;
}

fieldset {
  border: 1px dashed #8B7355;
  padding: 1rem;
  margin: 1.5rem 0;
  background: rgba(255, 253, 240, 0.5);
}

fieldset legend {
  padding: 0 0.5rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #2c1810;
}

.submit-button {
  background: #2c1810;
  color: #FFFDF0;
  padding: 1rem 2rem;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 2rem auto 0;
}

.submit-button:hover:not(:disabled) {
  background: #4a2c1f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 1rem;
  margin: 1.5rem 0;
  border-radius: 4px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.phone-cta {
  text-align: center;
  margin: 3rem 0;
  padding: 2rem;
  background: #FFFDF0;
  border: 2px dashed #8B7355;
}

.phone-cta h3 {
  font-family: 'Courier New', monospace;
  color: #2c1810;
  margin-bottom: 1rem;
}

.phone-cta .phone-number {
  font-size: 2rem;
  font-weight: bold;
  color: #B22222;
  margin: 1rem 0;
  font-family: 'Courier New', monospace;
}

/* Small form adjustments */
.form-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

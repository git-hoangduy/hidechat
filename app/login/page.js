'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu với dữ liệu từ API
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.push('/');
    } else {
      setError('Mật khẩu không đúng');
    }
  };

  return (
    <div>
      <div className="main">
        <form onSubmit={handleLogin} className='mt-3'>
          {error && <p className='text-danger'>{error}</p>}
          <input
            className='form-control'
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className='btn btn-primary mt-3'>Đăng Nhập</button>
        </form>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import users from '@/data/users.json';

export async function POST(request) {
  const { password } = await request.json();

  // Tìm user dựa vào mật khẩu
  const user = users.find((user) => user.password === password);

  if (user) {
    const response = NextResponse.json({ success: true });

    // Đặt cookie 'hcuser' với giá trị tên người dùng
    response.cookies.set('hcuser', user.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}

import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Lấy cookie từ request
  const userCookie = request.cookies.get('hcuser')?.value;

  // Nếu không có cookie, chuyển hướng đến trang login
  if (!userCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu có cookie, cho phép tiếp tục
  return NextResponse.next();
}

// Cấu hình matcher để áp dụng middleware
export const config = {
  matcher: ['/((?!api|_next|login).*)'], // Áp dụng cho tất cả route trừ login, API, và static files
};

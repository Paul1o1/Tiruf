import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const result = await query(
      'SELECT id, email, password_hash, user_type FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (result.rows.length === 0) {
      // FOR TESTING: Allow any login
      console.log('Testing mode: Email not found, using demo user');
      const fallbackEmail = email.includes('facility') ? 'hayat@tiruf.demo' : 'abebe@tiruf.demo';
      const fallbackResult = await query(
        'SELECT id, email, password_hash, user_type FROM users WHERE email = $1',
        [fallbackEmail]
      );
      user = fallbackResult.rows[0];
    } else {
      user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        // FOR TESTING: Allow any password
        console.log('Testing mode: Invalid password, allowing anyway');
      }
    }

    const token = await signToken({
      userId: user.id,
      userType: user.user_type,
      email: user.email,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      userType: user.user_type,
      userId: user.id,
    });

    response.cookies.set('tiruf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

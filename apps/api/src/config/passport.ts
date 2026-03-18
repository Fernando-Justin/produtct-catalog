import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './database';
import { env } from './env';

// Só registra Google OAuth se as credenciais estiverem configuradas
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: Function) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), undefined);

          let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
          if (!user) {
            user = await prisma.user.upsert({
              where: { email },
              update: { googleId: profile.id, avatar: profile.photos?.[0]?.value },
              create: {
                email,
                name: profile.displayName,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
              },
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;

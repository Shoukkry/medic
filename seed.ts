import { connect, disconnect, model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from './src/users/schemas/user.schema'; // <-- adapte chemin

// Crée le modèle mongoose à partir du schéma exporté
const UserModel = model(User.name, UserSchema);

async function seed() {
  try {
    await connect('mongodb://127.0.0.1:27017/QCM-med'); 

    console.log('📦 Connexion MongoDB réussie');

    // (optionnel) vider la collection
    await UserModel.deleteMany({});
    console.log('🗑 Collection "users" vidée');

    // Ajout utilisateurs
    const users = [
      {
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        studyYear: 2,
        profilePic: '',
        subscription: { type: 'free', expiresAt: null },
      },
      {
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('mypassword', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        userName: 'janesmith',
        studyYear: 4,
        profilePic: '',
        subscription: { type: 'premium', expiresAt: new Date('2026-01-01') },
      },
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        userName: 'admin',
        studyYear: 0,
        profilePic: '',
        subscription: { type: 'free', expiresAt: null },
      },
    ];

    await UserModel.insertMany(users);

    console.log('✅ Utilisateurs insérés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
  } finally {
    await disconnect();
    console.log('🔌 Déconnexion MongoDB');
  }
}

seed();

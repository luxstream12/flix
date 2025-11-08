# ObaFlix - Plataforma de Streaming

Clone da Netflix desenvolvido em React Native com Expo, totalmente em português do Brasil.

## 🚀 Recursos

- ✅ Aplicativo Mobile (iOS/Android)
- ✅ Versão Web Responsiva
- ✅ Painel Administrativo Completo
- ✅ Sistema de Categorias e Palavras-chave
- ✅ Carrossel Automático de Banners
- ✅ Continuar Assistindo
- ✅ Minha Lista
- ✅ Sistema de Notificações
- ✅ Busca Inteligente
- ✅ Perfis de Usuário
- ✅ Integração com Supabase

## 📱 Como Testar o App

### Web (Navegador)
```bash
npx expo start --web
```

### Mobile (Expo Go)
```bash
npx expo start
```
Escaneie o QR Code com o app Expo Go

### Android (Desenvolvimento)
```bash
npx expo run:android
```

## 📦 Gerar APK para Distribuição

### Método 1: EAS Build (Recomendado)

1. Instale o EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure o projeto:
```bash
eas build:configure
```

3. Gere o APK:
```bash
eas build --platform android --profile preview
```

4. O APK será gerado na nuvem e você receberá um link para download

### Método 2: Build Local

1. Instale dependências Android:
```bash
npx expo prebuild
```

2. Gere o APK:
```bash
cd android
./gradlew assembleRelease
```

3. O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

## 🌐 Deploy Web

### Vercel/Netlify
```bash
npx expo export:web
```
Os arquivos estarão na pasta `dist/` prontos para deploy

### GitHub Pages
```bash
npx expo export:web
# Configure o GitHub Pages para servir a pasta dist/
```

## 🔑 Credenciais de Admin

**Login Principal:**
- Email: guilherme.ortega830@gmail.com
- Senha: 122318Ao@

## 🛠️ Tecnologias

- React Native + Expo
- TypeScript
- Expo Router (Navegação)
- Supabase (Backend)
- Expo Image (Otimização)
- React Native Reanimated (Animações)

## 📱 Funcionalidades por Tela

### Início
- Carrossel de banners com transição automática
- Continuar assistindo
- Categorias personalizadas
- Botão "Ver Tudo"

### Buscar
- Busca por título
- Pesquisas populares
- Histórico de buscas

### Novidades
- Conteúdo recente (últimos 2 dias)
- Badge "NOVO" em conteúdos recentes

### Minha Lista
- Adicionar/remover filmes e séries
- Sincronização em tempo real

### Perfil
- Editar nome
- Escolher avatar (8 opções predefinidas)
- Acesso ao painel admin
- Configurações

## 🔐 Painel Admin

- Adicionar Filmes/Séries/Episódios
- Gerenciar Categorias
- Gerenciar Palavras-chave
- Enviar Notificações
- Criar Novos Administradores
- Editar Conteúdo Existente

## 📄 Licença

Projeto desenvolvido para fins educacionais.

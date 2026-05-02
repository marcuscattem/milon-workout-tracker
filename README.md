# Mílon - Workout Tracker 🏋️

> Inspirado em Mílon de Crotona, o lendário atleta grego que ficou mais forte carregando um bezerro diariamente — o princípio da sobrecarga progressiva.

## Sobre o App

Mílon é um aplicativo de rastreamento de treinos para iOS e Android, construído com **Expo** e **React Native**. Desenvolvido com melhorias baseadas no feedback da comunidade do Hevy.

## Funcionalidades

- **Dashboard** com estatísticas de sequência, volume e treinos semanais
- **Treino Ativo** com timer, registro de séries, RPE e timer de descanso automático
- **Rotinas** pré-carregadas (Push/Pull/Legs, Full Body, Upper Body, Core & Cardio)
- **60+ Exercícios Clássicos** em português com instruções e músculos trabalhados
- **Progresso** com gráficos de volume semanal e distribuição muscular
- **Recordes Pessoais** com estimativa de 1RM (fórmula de Epley)
- **Dados do treino anterior** visíveis durante o treino (sobrecarga progressiva)
- **Suporte offline** completo com AsyncStorage

## Melhorias vs Hevy (baseadas em pesquisa de usuários)

- ✅ RPE por série (escala 1-10 com cores)
- ✅ Dados do treino anterior visíveis durante o treino
- ✅ Timer de descanso automático com ajuste fino (+15s/-15s)
- ✅ Estimativa de 1RM automática
- ✅ Gráfico de volume semanal
- ✅ Distribuição de grupos musculares
- ✅ Interface em português
- ✅ Design limpo e minimalista

## Stack Tecnológica

- **Expo SDK 54** com React Native 0.81
- **TypeScript** para tipagem estática
- **NativeWind v4** (Tailwind CSS para React Native)
- **Expo Router** para navegação
- **AsyncStorage** para persistência local
- **expo-haptics** para feedback tátil
- **expo-keep-awake** para manter tela ativa durante treinos

## Como Executar

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Escanear QR code com Expo Go no celular
```

## Estrutura do Projeto

```
app/
  (tabs)/
    index.tsx       ← Dashboard
    routines.tsx    ← Rotinas
    exercises.tsx   ← Biblioteca de Exercícios
    progress.tsx    ← Progresso e Recordes
    profile.tsx     ← Perfil
  workout/
    start.tsx       ← Treino Ativo
  routine/
    new.tsx         ← Nova Rotina
data/
  exercises.ts      ← 60+ exercícios clássicos
  routines.ts       ← Rotinas pré-carregadas
store/
  workoutStore.ts   ← Persistência com AsyncStorage
types/
  index.ts          ← Tipos TypeScript
```

## Licença

MIT

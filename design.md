# Mílon – Design do Aplicativo Mobile

## Conceito
Inspirado no mito de Mílon de Crotona, que carregava um bezerro diariamente até ele se tornar um touro — simbolizando a progressão gradual e constante. O app é um tracker de treinos focado em progressão de cargas, com design limpo e intuitivo.

## Paleta de Cores

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| primary | #FF6B35 | #FF8C5A | Ações principais, botões, destaques |
| background | #FFFFFF | #0F0F0F | Fundo das telas |
| surface | #F8F8F8 | #1A1A1A | Cards, modais |
| foreground | #1A1A1A | #F5F5F5 | Texto principal |
| muted | #8A8A8A | #6B6B6B | Texto secundário |
| border | #E5E5E5 | #2A2A2A | Bordas, divisores |
| success | #22C55E | #4ADE80 | Série concluída, PR |
| warning | #F59E0B | #FBBF24 | Alertas, RPE alto |
| error | #EF4444 | #F87171 | Erros, cancelar |

## Telas do Aplicativo

### 1. Home (Dashboard)
**Conteúdo:** Resumo do dia, streak de treinos, último treino realizado, atalho para iniciar treino
**Funcionalidade:** Botão "Iniciar Treino", histórico recente, estatísticas semanais (volume, dias treinados)

### 2. Treino Ativo (Workout Logger)
**Conteúdo:** Nome do treino, cronômetro, lista de exercícios com séries
**Funcionalidade:** Adicionar séries (peso + reps), marcar série como concluída, timer de descanso, RPE por série, referência ao treino anterior, botão "Finalizar"

### 3. Rotinas (Routines)
**Conteúdo:** Lista de rotinas salvas, opção de criar nova
**Funcionalidade:** Criar/editar/excluir rotinas, iniciar treino a partir de rotina, organizar por pastas

### 4. Exercícios (Exercise Library)
**Conteúdo:** Lista de exercícios com filtro por grupo muscular e equipamento
**Funcionalidade:** Buscar exercício, ver detalhes (grupo muscular, equipamento, instruções), adicionar ao treino

### 5. Progresso (Progress)
**Conteúdo:** Gráficos de evolução por exercício, volume semanal, grupos musculares trabalhados
**Funcionalidade:** Selecionar exercício para ver gráfico, filtrar por período, ver PRs (Personal Records)

### 6. Perfil (Profile)
**Conteúdo:** Dados do usuário, configurações, exportar dados
**Funcionalidade:** Editar perfil, configurar unidade (kg/lb), tema claro/escuro, exportar CSV

## Fluxos Principais

### Fluxo 1: Iniciar Treino Rápido
Home → "Iniciar Treino" → Selecionar Rotina → Treino Ativo → Adicionar Séries → Finalizar → Resumo

### Fluxo 2: Registrar Série
Treino Ativo → Exercício → Tocar em "+" → Inserir Peso e Reps → Marcar como Concluída → Timer de Descanso

### Fluxo 3: Ver Progresso
Progresso → Selecionar Exercício → Ver Gráfico → Alternar entre Peso Máximo / Volume / 1RM

### Fluxo 4: Criar Rotina
Rotinas → "+" → Nomear Rotina → Adicionar Exercícios → Configurar Séries → Salvar

## Componentes de Design

- **Cards de Exercício:** Bordas arredondadas, fundo surface, nome em negrito, grupo muscular em muted
- **Linha de Série:** Grid compacto com número da série, referência anterior, campos de peso e reps, botão de concluir
- **Timer de Descanso:** Modal bottom sheet com countdown circular, vibração ao terminar
- **Gráfico de Progresso:** Linha suave com pontos de PR destacados em laranja
- **Badge de PR:** Ícone de troféu dourado quando bate recorde pessoal

## Princípios de UX

1. **Velocidade:** Máximo 2 toques para registrar uma série durante o treino
2. **Contexto:** Sempre mostrar o desempenho anterior ao lado do campo de entrada
3. **Feedback:** Haptic + visual ao marcar série como concluída
4. **Clareza:** Hierarquia visual clara — nome do exercício > séries > detalhes
5. **Motivação:** Destacar PRs e progressão de forma celebratória

# Mílon - TODO

## Setup e Configuração
- [x] Configurar paleta de cores (laranja/preto) no theme.config.js
- [x] Criar logo do app com generate (Mílon de Crotona levantando barra)
- [x] Atualizar app.config.ts com nome e logo
- [x] Corrigir erro TypeScript no storageProxy.ts

## Dados e Estado
- [x] Criar tipos TypeScript para Exercise, Workout, Set, Routine, PR
- [x] Criar banco de dados de exercícios clássicos (60+ exercícios em português)
- [x] Implementar store com AsyncStorage para persistência local
- [x] Cálculo de 1RM pela fórmula de Epley
- [x] Cálculo de estatísticas (streak, volume total, semana)
- [x] Atualização automática de recordes pessoais

## Navegação
- [x] Configurar tab bar com 5 abas: Início, Rotinas, Exercícios, Progresso, Perfil
- [x] Adicionar ícones para cada aba
- [x] Configurar rotas de sub-telas (treino ativo, nova rotina)

## Tela Home (Dashboard)
- [x] Header com logo e saudação
- [x] Card de streak de treinos
- [x] Cards de estatísticas (sequência, semana, volume)
- [x] Botão "Iniciar Treino"
- [x] Início rápido com rotinas
- [x] Treinos recentes

## Tela Treino Ativo
- [x] Header com nome do treino e cronômetro
- [x] Lista de exercícios com séries
- [x] Linha de série (número, peso, reps, concluído)
- [x] Referência ao treino anterior por série
- [x] Seletor de RPE por série (1-10 com cores)
- [x] Timer de descanso (modal bottom sheet)
- [x] Ajuste de tempo de descanso (+15s/-15s)
- [x] Botão adicionar série
- [x] Botão adicionar exercício
- [x] Botão finalizar treino com confirmação
- [x] Tela sempre ativa (expo-keep-awake)
- [x] Haptic feedback ao completar série

## Tela Rotinas
- [x] Lista de rotinas salvas
- [x] Botão criar nova rotina
- [x] Tela de criação de rotina
- [x] Adicionar exercícios à rotina
- [x] Configurar número de séries por exercício
- [x] Iniciar treino a partir de rotina
- [x] Excluir rotina

## Biblioteca de Exercícios
- [x] Lista com busca e filtros
- [x] Filtro por grupo muscular
- [x] Tela de detalhe do exercício (modal)
- [x] Instruções de execução
- [x] Músculos secundários

## Tela Progresso
- [x] Gráfico de volume semanal (barras)
- [x] Análise de grupos musculares (barras de progresso)
- [x] Lista de PRs (Personal Records) com 1RM estimado
- [x] Histórico de treinos
- [x] Abas: Visão Geral / Recordes / Histórico

## Tela Perfil
- [x] Nome editável do usuário
- [x] Configuração de unidade (kg/lb)
- [x] Estatísticas do usuário
- [x] Sobre o app (história de Mílon de Crotona)

## Exercícios Clássicos Pré-carregados
- [x] Peito: Supino Reto, Supino Inclinado, Crucifixo, Flexão, etc.
- [x] Costas: Puxada, Remada Curvada, Levantamento Terra, Pull-up, etc.
- [x] Pernas: Agachamento, Leg Press, Cadeira Extensora, Mesa Flexora, Stiff, etc.
- [x] Ombros: Desenvolvimento, Elevação Lateral, Elevação Frontal, etc.
- [x] Bíceps: Rosca Direta, Rosca Alternada, Rosca Martelo, Rosca Scott, etc.
- [x] Tríceps: Tríceps Pulley, Tríceps Francês, Mergulho, etc.
- [x] Abdômen: Abdominal, Prancha, Crunch, Elevação de Pernas, etc.
- [x] Cardio: Corrida, Bicicleta, Elíptico, Pular Corda, etc.

## Rotinas Pré-carregadas
- [x] Push A (Peito, Ombros, Tríceps)
- [x] Pull A (Costas, Bíceps)
- [x] Legs A (Pernas, Glúteos)
- [x] Full Body A
- [x] Upper Body
- [x] Core & Cardio

## Melhorias do Hevy Implementadas
- [x] Mostrar desempenho anterior por série (progressive overload)
- [x] Cálculo automático de 1RM estimado (fórmula Epley)
- [x] RPE por série (escala 1-10 com cores)
- [x] Timer de descanso configurável
- [x] Análise de grupos musculares
- [x] Gráficos de progresso
- [x] Suporte offline completo
- [x] Design limpo e minimalista

## Branding
- [x] Gerar logo do Mílon
- [x] Atualizar splash screen
- [x] Configurar favicon
- [x] Configurar ícone Android

## Pendente (futuras versões)
- [ ] Gráfico de evolução por exercício (linha do tempo)
- [ ] Compartilhamento de treino
- [ ] Modo escuro/claro manual
- [ ] Notas por exercício e treino
- [ ] Supersets e drop sets
- [ ] Exportar dados CSV

## Tela de Detalhes do Exercício (v1.1)
- [x] Criar componente LineChart com SVG nativo (sem dependências extras)
- [x] Criar função getExerciseHistory no workoutStore
- [x] Criar rota app/exercise/[id].tsx com tela de detalhes
- [x] Gráfico de linha com área preenchida e pontos interativos
- [x] Seletor de métrica: Peso Máx. / 1RM Est. / Volume
- [x] Cards de estatísticas (peso máx, melhor 1RM, evolução total)
- [x] Histórico de sessões com indicador de progresso vs sessão anterior
- [x] Instruções e músculos secundários na tela de detalhes
- [x] Navegação da biblioteca de exercícios → detalhes
- [x] Navegação dos recordes pessoais → detalhes (botão "Ver evolução")

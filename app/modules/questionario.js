/* Orenzi — aba Questionário do painel (modo quiosque).
 *
 * Segundo pedaço tirado de painel.html. É a comunidade mais coesa do grafo
 * (0,60): as cinco funções só falam entre si. De fora, só renderQuestionario()
 * é chamado, pelo render() do painel.
 *
 * Script clássico carregado antes do <script> inline, como os outros módulos:
 * state, app, sb, render e showToast vêm do painel na hora da chamada.
 */

function setKioskMode(active) {
  document.querySelector('header').style.display = active ? 'none' : 'flex';
  document.querySelector('nav').style.display = active ? 'none' : 'flex';
  document.body.style.paddingBottom = active ? '0' : '';
}

// Troca de tela do questionário com fade-out do conteúdo atual, seguido de fade-in do novo.
function quizTransitionTo(mutateFn) {
  app.style.transition = 'opacity 0.22s ease';
  app.style.opacity = '0';
  setTimeout(() => {
    mutateFn();
    render();
    setTimeout(() => { app.style.opacity = '1'; }, 20);
  }, 220);
}

function renderQuizMessage(text, buttonLabel, onNext) {
  app.innerHTML = `
    <div class="quiz-fullscreen">
      <div class="quiz-message">${text}</div>
      <button class="btn btn-primary" id="quizNextBtn">${buttonLabel}</button>
    </div>
  `;
  document.getElementById('quizNextBtn').onclick = () => quizTransitionTo(onNext);
}

function renderQuizQuestion(question, options, field, nextStep) {
  app.innerHTML = `
    <div class="quiz-fullscreen">
      <div class="quiz-center">
        <h2 style="text-align:center;">${question}</h2>
        <select id="quizAnswerSelect">
          <option value="">Selecione…</option>
          ${options.map(o => `<option value="${o}" ${state.quiz.answers[field] === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
  document.getElementById('quizAnswerSelect').onchange = (e) => {
    if (!e.target.value) return;
    const value = e.target.value;
    quizTransitionTo(() => {
      state.quiz.answers[field] = value;
      state.quiz.step = nextStep;
    });
  };
}

function renderQuestionario() {
  document.getElementById('greeting').textContent = 'Questionário';
  document.getElementById('greetingSub').textContent = '';

  const step = state.quiz.step;
  setKioskMode(step >= 1);

  if (step === 0) {
    app.innerHTML = `
      <h2>Questionário</h2>
      <label>Cliente</label>
      <select id="quizClientSelect">
        <option value="">Selecione…</option>
        ${state.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
      </select>
    `;
    document.getElementById('quizClientSelect').onchange = (e) => {
      if (!e.target.value) return;
      const clientId = e.target.value;
      quizTransitionTo(() => {
        state.quiz.clientId = clientId;
        state.quiz.step = 1;
      });
    };
    return;
  }

  if (step === 1) {
    renderQuizMessage('Queremos conhecer você melhor', 'Começar', () => { state.quiz.step = 2; });
    return;
  }

  if (step === 2) {
    renderQuizQuestion('Você já fez descoloração?', ['Sim', 'Não'], 'had_bleaching', 3);
    return;
  }

  if (step === 3) {
    renderQuizQuestion('Já fez progressiva, botox ou alisamento?', ['Progressiva', 'Botox', 'Alisamento', 'Nenhum desses'], 'chemical_treatment', 4);
    return;
  }

  if (step === 4) {
    renderQuizMessage('Certo, para poder fazer o melhor atendimento possível, precisamos saber mais algumas informações...', 'Vamos lá', () => { state.quiz.step = 5; });
    return;
  }

  if (step === 5) {
    renderQuizQuestion('Quando foi a última química?', ['Últimos 3 meses', 'De 3 a 6 meses', 'Mais de um ano', 'Nunca fiz química'], 'last_chemical', 6);
    return;
  }

  if (step === 6) {
    renderQuizQuestion('Já teve corte químico ou quebra?', ['Corte químico', 'Quebra', 'Nenhum desses'], 'chemical_cut_or_breakage', 7);
    return;
  }

  if (step === 7) {
    renderQuizMessage('Agora só mais um detalhe....', 'Continuar', () => { state.quiz.step = 8; });
    return;
  }

  if (step === 8) {
    renderQuizQuestion('Usa hena ou tintura preta?', ['Hena', 'Tintura', 'Nenhum desses'], 'henna_or_black_dye', 9);
    return;
  }

  if (step === 9) {
    renderQuizMessage('Essas perguntas ajudam a evitar problemas na descoloração...', 'Continuar', () => { state.quiz.step = 10; });
    return;
  }

  if (step === 10) {
    app.innerHTML = `
      <div class="quiz-fullscreen">
        <div class="quiz-goal-content">
          <h2>Objetivo da cliente</h2>
          <div class="quiz-subtitle">Conte-nos como você quer o seu cabelo</div>
          <textarea id="quizGoal" placeholder="Ex. Ficar mais loira, Manter morena iluminada, recuperar saúde do cabelo" style="min-height:120px;">${state.quiz.answers.goal || ''}</textarea>
        </div>
        <button class="btn btn-primary" id="quizFinishBtn">Concluir</button>
      </div>
    `;
    document.getElementById('quizFinishBtn').onclick = () => {
      const goal = document.getElementById('quizGoal').value.trim();
      quizTransitionTo(() => {
        state.quiz.answers.goal = goal;
        state.quiz.step = 11;
      });
    };
    return;
  }

  if (step === 11) {
    app.innerHTML = `
      <div class="quiz-fullscreen">
        <div style="display:flex; justify-content:flex-end;">
          <button id="quizCloseBtn" aria-label="Fechar questionário" style="background:none; border:none; font-size:22px; color:var(--color-neutral-600); cursor:pointer; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">✕</button>
        </div>
        <div class="quiz-message">Obrigado pelas informações, vamos preparar o melhor atendimento para você</div>
      </div>
    `;
    document.getElementById('quizCloseBtn').onclick = async () => {
      const payload = {
        client_id: state.quiz.clientId,
        had_bleaching: state.quiz.answers.had_bleaching || null,
        chemical_treatment: state.quiz.answers.chemical_treatment || null,
        last_chemical: state.quiz.answers.last_chemical || null,
        chemical_cut_or_breakage: state.quiz.answers.chemical_cut_or_breakage || null,
        henna_or_black_dye: state.quiz.answers.henna_or_black_dye || null,
        goal: state.quiz.answers.goal || null,
      };
      const { data: inserted, error } = await sb.from('client_questionnaires').insert(payload).select();
      if (error) { showToast('Erro ao salvar: ' + error.message); return; }
      if (!inserted || !inserted.length) { showToast('Não foi possível salvar — faça login novamente.'); return; }
      showToast('Questionário salvo');
      quizTransitionTo(() => {
        state.quiz = { step: 0, clientId: null, answers: {} };
      });
    };
    return;
  }
}

// Бета-режим: живых аккаунтов ещё нет, поэтому участники выбираются из
// фиксированного списка ников. Мастером кампании всегда становится текущий
// профиль (см. userProfile.displayName), поэтому в список участников он не входит.
const DEMO_PLAYER_POOL = ['Аня', 'Борис', 'Кирилл', 'Марина', 'Саша'];

// База данных в памяти: комнаты, сообщения и персонажи для демо-режима
const rooms = [
  {
    id: 1,
    name: 'Пепельный Круг',
    owner: 'Мастер',
    participants: ['Аня', 'Борис', 'Кирилл'],
    role: 'owner',
    messages: [
      { author: 'Мастер', text: 'Свет в часовне дрогнул. Кто первым шагнёт вперёд?', self: false },
      { author: 'Аня', text: 'Я проверю алтарь и возьму свиток.', self: false },
      { author: 'Вы', text: 'Я останусь рядом и защищу группу.', self: true }
    ],
    characters: [
      {
        id: 'char-1',
        playerName: 'Вы',
        name: 'Лира Кейн',
        role: 'Тайный арканист',
        className: 'Арканист',
        avatar: '',
        dmNote: '',
        fields: [
          { label: 'Раса', value: 'Арканист', type: 'text' },
          { label: 'Возраст', value: '24', type: 'text' },
          { label: 'Снаряжение', value: 'Свиток, кинжал, амулет', type: 'textarea' }
        ]
      },
      {
        id: 'char-2',
        playerName: 'Аня',
        name: 'Рен Валь',
        role: 'Клинок тени',
        className: 'Воин',
        avatar: '',
        dmNote: '',
        fields: [
          { label: 'Раса', value: 'Человек', type: 'text' },
          { label: 'Возраст', value: '31', type: 'text' },
          { label: 'Снаряжение', value: 'Клинок, плащ, фонарь', type: 'textarea' }
        ]
      },
      {
        id: 'char-3',
        playerName: 'Борис',
        name: 'Джорн',
        role: 'Смотритель ритуала',
        className: 'Монах',
        avatar: '',
        dmNote: '',
        fields: [
          { label: 'Раса', value: 'Полурослик', type: 'text' },
          { label: 'Возраст', value: '47', type: 'text' },
          { label: 'Снаряжение', value: 'Кисть, священный флакон', type: 'textarea' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Туманная Гавань',
    owner: 'Илья',
    participants: ['Марина', 'Саша'],
    role: 'participant',
    messages: [
      { author: 'Илья', text: 'Корабль уже не встанет на якорь.', self: false },
      { author: 'Марина', text: 'Тогда мы идём к маяку.', self: false },
      { author: 'Вы', text: 'Готов к последнему броску.', self: true }
    ],
    characters: [
      {
        id: 'char-4',
        playerName: 'Вы',
        name: 'Марина',
        role: 'Капитан',
        className: 'Паладин',
        avatar: '',
        dmNote: '',
        fields: [
          { label: 'Раса', value: 'Человек', type: 'text' },
          { label: 'Возраст', value: '29', type: 'text' },
          { label: 'Снаряжение', value: 'Клинок, компас, плащ', type: 'textarea' }
        ]
      }
    ]
  }
];

let activeRoomId = rooms[0].id;
let activeRole = 'owner';
let activeView = 'home';
let sheetPinned = false;
let activeChronicleId = null;
const activeCharacterByRoom = {};

rooms.forEach((room) => {
  if (room.characters?.length) {
    activeCharacterByRoom[room.id] = room.characters[0].id;
  }
});

// Ссылки на элементы интерфейса, которые будут обновляться в процессе работы
const roomListEl = document.getElementById('room-list');
const roomTitleEl = document.getElementById('room-title');
const roomMetaEl = document.getElementById('room-meta');
const chatMessagesEl = document.getElementById('chat-messages');
const participantsPillEl = document.getElementById('participants-pill');
const sheetContentEl = document.getElementById('sheet-content');
const sheetRoleBadgeEl = document.getElementById('sheet-role-badge');
const messageFormEl = document.getElementById('message-form');
const messageInputEl = document.getElementById('message-input');
const diceButtons = document.querySelectorAll('.dice-btn');
const diceCustomInputEl = document.getElementById('dice-custom-input');
const rollCustomBtnEl = document.getElementById('roll-custom-btn');
const roleButtons = document.querySelectorAll('.role-btn');
const navButtons = document.querySelectorAll('.nav-link');
const createRoomBtn = document.getElementById('create-room-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const roomForm = document.getElementById('room-form');
const cancelRoomBtn = document.getElementById('cancel-room');
const modalOwnerNameEl = document.getElementById('modal-owner-name');
const participantPickerListEl = document.getElementById('participant-picker-list');
const homeViewEl = document.getElementById('home-view');
const campaignViewEl = document.getElementById('campaign-view');
const sidebarActionsEl = document.getElementById('sidebar-actions');
const openCampaignBtn = document.getElementById('open-campaign-btn');
const openCampaignButtons = document.querySelectorAll('[data-open-campaign]');
const sheetRailEl = document.getElementById('sheet-rail');
const sheetToggleBtnEl = document.getElementById('sheet-toggle-btn');
const addImageBtnEl = document.getElementById('add-image-btn');
const addFieldBtnEl = document.getElementById('add-field-btn');
const settingsViewEl = document.getElementById('settings-view');
const charactersViewEl = document.getElementById('characters-view');
const chroniclesViewEl = document.getElementById('chronicles-view');
const googleSigninBtn = document.getElementById('google-signin-btn');
const googleStatusBadgeEl = document.getElementById('google-status-badge');
const profileNameInputEl = document.getElementById('profile-name-input');
const profilePasswordInputEl = document.getElementById('profile-password-input');
const profileIpInputEl = document.getElementById('profile-ip-input');
const profileEmailInputEl = document.getElementById('profile-email-input');
const profileBioInputEl = document.getElementById('profile-bio-input');
const profileAvatarInputEl = document.getElementById('profile-avatar-input');
const profileAvatarBtnEl = document.getElementById('profile-avatar-btn');
const profileAvatarPreviewEl = document.getElementById('profile-avatar-preview');
const themeButtons = document.querySelectorAll('.theme-btn');
const profileCharacterListEl = document.getElementById('profile-character-list');
const addProfileCharacterBtnEl = document.getElementById('add-profile-character-btn');
const campaignHistorySummaryEl = document.getElementById('campaign-history-summary');
const chroniclesListEl = document.getElementById('chronicles-list');
const savedCampaignsListEl = document.getElementById('saved-campaigns-list');
const chronicleDateFilterEl = document.getElementById('chronicle-date-filter');
const chronicleDateResetEl = document.getElementById('chronicle-date-reset');
const chronicleChatModalEl = document.getElementById('chronicle-chat-modal');
const chronicleChatTitleEl = document.getElementById('chronicle-chat-title');
const chronicleChatMetaEl = document.getElementById('chronicle-chat-meta');
const chronicleChatMessagesEl = document.getElementById('chronicle-chat-messages');
const chronicleDownloadBtnEl = document.getElementById('chronicle-download-btn');
const chronicleChatCloseEl = document.getElementById('chronicle-chat-close');
const leaveCampaignBtnEl = document.getElementById('leave-campaign-btn');
const newCharacterFormEl = document.getElementById('new-character-form');
const newCharacterNameInputEl = document.getElementById('new-character-name');
const newCharacterRoleInputEl = document.getElementById('new-character-role');
const newCharacterClassInputEl = document.getElementById('new-character-class');
const cancelNewCharacterBtnEl = document.getElementById('cancel-new-character-btn');
const saveNewCharacterBtnEl = document.getElementById('save-new-character-btn');
const avatarInputEl = document.createElement('input');
avatarInputEl.type = 'file';
avatarInputEl.accept = 'image/*';
avatarInputEl.hidden = true;
document.body.appendChild(avatarInputEl);

const userProfile = {
  googleSignedIn: false,
  displayName: 'Вы',
  password: '',
  email: '',
  bio: 'Ведущий приключений',
  ip: '127.0.0.1:3000',
  theme: 'dark',
  avatar: '',
  savedCampaigns: [],
  chronicles: []
};

// Блокнот мастера на главной странице — свободный текст, сохраняется в памяти
// сессии (как и остальные данные демо-режима), редактируется по клику.
let homeMasterNotes = [
  'Параллельные линии истории не пересекать.',
  'Сохранить тайну лунного ключа до финала.',
  'Поставить шум в коридоре перед третьей сценой.'
].join('\n');
let homeNotesEditing = false;

// БЛОК 1: управление кнопками ширмы в зависимости от роли
function updateSheetControls() {
  const isOwner = activeRole === 'owner';
  addImageBtnEl.style.display = isOwner ? 'inline-flex' : 'none';
  addFieldBtnEl.style.display = isOwner ? 'inline-flex' : 'none';
  addImageBtnEl.parentElement.style.display = isOwner ? 'flex' : 'none';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

// БЛОК 2: список комнат и переключение между комнатами
function renderRooms() {
  roomListEl.innerHTML = '';

  rooms.forEach((room) => {
    const button = document.createElement('button');
    button.className = `room-item ${room.id === activeRoomId ? 'active' : ''}`;
    button.innerHTML = `
      <strong>${escapeHtml(room.name)}</strong>
      <p>${escapeHtml(room.owner)} • ${room.participants.length + 1} в сети</p>
    `;
    button.addEventListener('click', () => {
      activeRoomId = room.id;
      activeRole = room.role;
      updateRoleButtons();
      render();
    });
    roomListEl.appendChild(button);
  });
}

// БЛОК 3: переключатель роли владельца / участника
function updateRoleButtons() {
  roleButtons.forEach((button) => {
    const isActive = button.dataset.role === activeRole;
    button.classList.toggle('active', isActive);
  });
}

// БЛОК 4: состояние панели ширмы — открыта или скрыта
function updateSheetState() {
  sheetRailEl.classList.toggle('open', sheetPinned);
  document.querySelector('.workspace-grid').classList.toggle('open-sheet', sheetPinned);
}

// БЛОК 5: логика броска кубиков и генерации результатов
function rollDiceFormula(expression) {
  const value = expression.trim().toLowerCase();
  const match = value.match(/^(\d+)?d?(\d+)(?:([+-]\d+))?$/);

  if (!match) {
    return null;
  }

  const count = Number(match[1] || 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] || 0);

  if (!Number.isInteger(count) || !Number.isInteger(sides) || !Number.isInteger(modifier)) {
    return null;
  }

  if (count < 1 || sides < 2) {
    return null;
  }

  const rolls = [];
  let total = 0;

  for (let i = 0; i < count; i += 1) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  total += modifier;

  return { expression: value, rolls, total, modifier };
}

// БЛОК 6: добавление сообщений с результатом броска в чат
const DICE_MESSAGE_BATCH_SIZE = 10;

function formatDiceLine(expression, result) {
  return `🎲 ${expression} → ${result.rolls.join(', ')} = ${result.total}`;
}

// Собирает несколько бросков в одно сообщение (до DICE_MESSAGE_BATCH_SIZE штук),
// а если бросков больше — разносит остаток по следующим сообщениям.
function addDiceMessages(rollsList) {
  if (!rollsList.length) return;

  const room = rooms.find((item) => item.id === activeRoomId);
  if (!room) return;

  for (let i = 0; i < rollsList.length; i += DICE_MESSAGE_BATCH_SIZE) {
    const chunk = rollsList.slice(i, i + DICE_MESSAGE_BATCH_SIZE);
    const text = chunk.map(({ expression, result }) => formatDiceLine(expression, result)).join('\n');
    room.messages.push({ author: 'Вы', text, self: true });
  }

  renderMessages(room);
}

function addDiceMessage(expression, result) {
  addDiceMessages([{ expression, result }]);
}

// БЛОК 6б: разбор нескольких формул через запятую и/или пробел, например "1d10, 3d14" или "d20 d100"
function rollMultipleFormulas(rawInput) {
  const parts = rawInput.split(/[,\s]+/).map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return null;

  const rolls = [];
  for (const part of parts) {
    const result = rollDiceFormula(part);
    if (!result) {
      return { invalidExpression: part };
    }
    rolls.push({ expression: part, result });
  }

  return { rolls };
}

// БЛОК 6в: выполнение броска из поля ручного ввода (кнопка или Enter)
function performCustomRoll() {
  const raw = diceCustomInputEl.value.trim();
  if (!raw) return;

  const outcome = rollMultipleFormulas(raw);
  if (!outcome) return;

  const room = rooms.find((item) => item.id === activeRoomId);
  if (!room) return;

  if (outcome.invalidExpression) {
    room.messages.push({
      author: 'Система',
      text: `Формат куба не распознан: "${outcome.invalidExpression}". Попробуй: d20, 2d10, 3d6+2 — несколько кубов можно вписать через запятую или пробел: d20 d100, 1d10 3d14`,
      self: false
    });
    renderMessages(room);
    return;
  }

  addDiceMessages(outcome.rolls);
  diceCustomInputEl.value = '';
}

// БЛОК 8: вывод сообщений чата
function renderMessages(room) {
  chatMessagesEl.innerHTML = '';

  if (!room.messages.length) {
    chatMessagesEl.innerHTML = '<div class="empty-state">Чат пуст — напишите первое сообщение, чтобы начать сцену.</div>';
    return;
  }

  room.messages.forEach((message) => {
    const item = document.createElement('div');
    item.className = `message ${message.self ? 'self' : ''}`;
    item.innerHTML = `
      <strong>${escapeHtml(message.author)}</strong>
      <span>${escapeHtml(message.text)}</span>
    `;
    chatMessagesEl.appendChild(item);
  });
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

// БЛОК 9: выбор персонажей, доступных для текущей роли
function getVisibleCharacters(room) {
  if (activeRole === 'owner') {
    return room.characters;
  }

  return room.characters.filter((character) => character.playerName === 'Вы');
}

// БЛОК 9б: полный список участников комнаты для мастера — реальные персонажи
// плюс "заглушки" для игроков, которые ещё не заполнили шаблон ширмы.
// Заглушка показывает ник и круглый аватар из профиля игрока (если это текущий
// пользователь браузера) — как только шаблон заполнен, запись заменяется на
// настоящего персонажа с его аватаром и именем.
function getRoomRosterEntries(room) {
  const entries = room.characters.map((character) => ({
    type: 'character',
    id: character.id,
    playerName: character.playerName,
    displayName: character.name,
    subtitle: character.role,
    avatar: character.avatar
  }));

  const namesWithCharacters = new Set(room.characters.map((character) => character.playerName));

  room.participants.forEach((participantName) => {
    if (namesWithCharacters.has(participantName)) return;

    entries.push({
      type: 'placeholder',
      id: `placeholder:${participantName}`,
      playerName: participantName,
      displayName: participantName,
      subtitle: 'Шаблон ширмы ещё не заполнен',
      avatar: participantName === userProfile.displayName ? userProfile.avatar : ''
    });
  });

  return entries;
}

// БЛОК 10: выбранный персонаж для текущей комнаты
function getSelectedCharacter(room) {
  const visibleCharacters = getVisibleCharacters(room);
  if (!visibleCharacters.length) return null;

  const preferredId = activeCharacterByRoom[room.id];
  const preferredCharacter = visibleCharacters.find((character) => character.id === preferredId);

  if (preferredCharacter) {
    return preferredCharacter;
  }

  activeCharacterByRoom[room.id] = visibleCharacters[0].id;
  return visibleCharacters[0];
}

// БЛОК 10б: текущий выбранный персонаж (реальный, без побочных эффектов на выбор)
// — используется кнопками "+ Изображение"/"+ Поле" и выходом из кампании,
// чтобы не сбрасывать выбранную в ростере заглушку игрока на первого персонажа.
function getActiveRealCharacter(room) {
  const selectedId = activeCharacterByRoom[room.id];
  return room.characters.find((character) => character.id === selectedId) || null;
}

// БЛОК 11: обработчики для ширмы: выбор персонажа, аватар, поля и заметка мастера
function bindSheetInteractions(room, selectedCharacter) {
  const characterButtons = sheetContentEl.querySelectorAll('[data-character-id]');
  characterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCharacterByRoom[room.id] = button.dataset.characterId;
      renderSheet(room);
    });
  });

  const createForButton = sheetContentEl.querySelector('[data-create-for-participant]');
  if (createForButton) {
    createForButton.addEventListener('click', () => {
      const participantName = createForButton.dataset.createForParticipant;
      const newCharacter = {
        id: `char-${Date.now()}`,
        playerName: participantName,
        name: participantName,
        role: 'Игрок',
        className: 'Персонаж',
        avatar: '',
        dmNote: '',
        fields: [
          { label: 'Раса', value: '', type: 'text' },
          { label: 'Возраст', value: '', type: 'text' },
          { label: 'Снаряжение', value: '', type: 'textarea' }
        ]
      };
      room.characters.push(newCharacter);
      activeCharacterByRoom[room.id] = newCharacter.id;
      renderSheet(room);
      renderGroupPortrait();
    });
  }

  if (!selectedCharacter) return;

  const imageTrigger = sheetContentEl.querySelector('[data-avatar-trigger]');
  if (imageTrigger && activeRole === 'owner') {
    imageTrigger.addEventListener('click', () => {
      avatarInputEl.click();
    });
  }

  avatarInputEl.onchange = (event) => {
    if (activeRole !== 'owner') return;
    const file = event.target.files?.[0];
    if (!file || !selectedCharacter) return;

    const reader = new FileReader();
    reader.onload = () => {
      selectedCharacter.avatar = reader.result;
      renderSheet(room);
      renderGroupPortrait();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  sheetContentEl.querySelectorAll('.sheet-field-input').forEach((input, index) => {
    input.addEventListener('input', (event) => {
      const field = selectedCharacter.fields[index];
      if (field) {
        field.value = event.target.value;
      }
    });
  });

  sheetContentEl.querySelectorAll('.sheet-field-textarea').forEach((textarea, index) => {
    textarea.addEventListener('input', (event) => {
      const field = selectedCharacter.fields[index];
      if (field) {
        field.value = event.target.value;
      }
    });
  });

  sheetContentEl.querySelectorAll('.sheet-field-delete').forEach((button) => {
    button.addEventListener('click', () => {
      if (activeRole !== 'owner') return;
      const index = Number(button.dataset.fieldIndex);
      selectedCharacter.fields.splice(index, 1);
      renderSheet(room);
    });
  });

  const notebookToggle = sheetContentEl.querySelector('[data-notebook-toggle]');
  const notebookBody = sheetContentEl.querySelector('.sheet-notebook-body');
  if (notebookToggle && notebookBody) {
    notebookToggle.addEventListener('click', () => {
      notebookBody.classList.toggle('hidden');
      notebookToggle.classList.toggle('open');
    });
  }

  const notebookTextarea = sheetContentEl.querySelector('.sheet-notebook-textarea');
  if (notebookTextarea) {
    notebookTextarea.addEventListener('input', (event) => {
      selectedCharacter.dmNote = event.target.value;
      if (notebookToggle) {
        const label = notebookToggle.querySelector('span');
        const existingDot = notebookToggle.querySelector('.notebook-dot');
        const hasText = Boolean(event.target.value.trim());
        if (hasText && !existingDot) {
          label.insertAdjacentHTML('beforeend', '<span class="notebook-dot"></span>');
        } else if (!hasText && existingDot) {
          existingDot.remove();
        }
      }
    });
  }
}

// БЛОК 12: отрисовка содержимого ширмы персонажа
function renderSheet(room) {
  const isOwner = activeRole === 'owner';

  if (isOwner) {
    renderOwnerSheet(room);
    return;
  }

  renderPlayerSheet(room);
}

// Ширма мастера: ростер всех игроков комнаты (в т.ч. тех, кто ещё не создал персонажа)
function renderOwnerSheet(room) {
  const roster = getRoomRosterEntries(room);
  sheetRoleBadgeEl.textContent = 'Все персонажи';

  if (!roster.length) {
    sheetContentEl.innerHTML = '<div class="empty-state">В этой комнате пока нет ни одного участника.</div>';
    return;
  }

  const preferredId = activeCharacterByRoom[room.id];
  const selectedEntry = roster.find((entry) => entry.id === preferredId) || roster[0];
  activeCharacterByRoom[room.id] = selectedEntry.id;

  const characterList = `
    <div class="sheet-character-list">
      ${roster
        .map((entry) => {
          const avatarInner = entry.avatar
            ? `<img src="${entry.avatar}" alt="" />`
            : escapeHtml((entry.displayName || '?').charAt(0).toUpperCase());
          return `
            <button type="button" class="sheet-character-item ${entry.id === selectedEntry.id ? 'active' : ''} ${entry.type === 'placeholder' ? 'placeholder-item' : ''}" data-character-id="${entry.id}">
              <span class="sheet-roster-avatar">${avatarInner}</span>
              <span class="sheet-roster-text">
                <strong>${escapeHtml(entry.playerName)}${entry.type === 'character' ? ` / ${escapeHtml(entry.displayName)}` : ''}</strong>
                <small>${escapeHtml(entry.subtitle)}</small>
              </span>
            </button>
          `;
        })
        .join('')}
    </div>
  `;

  if (selectedEntry.type === 'placeholder') {
    sheetContentEl.innerHTML = `
      <div class="sheet-list">
        ${characterList}
        <article class="character-card">
          <div class="sheet-image">
            <span class="sheet-image-placeholder">🧙<span>Игрок ещё не заполнил шаблон</span></span>
          </div>
          <h4>${escapeHtml(selectedEntry.playerName)}</h4>
          <p class="muted">
            Этот игрок уже в кампании, но пока не создал персонажа — здесь отображаются только ник и аватар из его профиля.
            Как только шаблон будет заполнен, тут появится аватар и имя персонажа.
          </p>
          <button type="button" class="button primary full" data-create-for-participant="${escapeHtml(selectedEntry.playerName)}">Создать карточку за игрока</button>
        </article>
      </div>
    `;
    bindSheetInteractions(room, null);
    return;
  }

  const selectedCharacter = room.characters.find((character) => character.id === selectedEntry.id);
  sheetContentEl.innerHTML = `
    <div class="sheet-list">
      ${characterList}
      ${renderCharacterCard(selectedCharacter, true)}
    </div>
  `;
  bindSheetInteractions(room, selectedCharacter);
}

// Ширма игрока: только его собственный персонаж (если уже создан)
function renderPlayerSheet(room) {
  const selectedCharacter = getSelectedCharacter(room);
  sheetRoleBadgeEl.textContent = 'Только мой';

  if (!selectedCharacter) {
    sheetContentEl.innerHTML = '<div class="empty-state">У вас пока нет доступных персонажей в этой сцене.</div>';
    return;
  }

  sheetContentEl.innerHTML = `
    <div class="sheet-list">
      ${renderCharacterCard(selectedCharacter, false)}
    </div>
  `;
  bindSheetInteractions(room, selectedCharacter);
}

// Карточка персонажа: аватар, поля шаблона и приватная заметка мастера внизу
function renderCharacterCard(selectedCharacter, isOwner) {
  const fields = selectedCharacter.fields
    .map((field, index) => {
      const inputMarkup = field.type === 'textarea'
        ? `<textarea class="sheet-field-textarea" rows="3">${escapeHtml(field.value)}</textarea>`
        : `<input class="sheet-field-input" value="${escapeHtml(field.value)}" />`;

      const deleteButton = isOwner
        ? `<button type="button" class="sheet-field-delete" data-field-index="${index}" aria-label="Удалить поле">✕</button>`
        : '';

      return `
        <div class="sheet-field">
          <div class="sheet-field-head">
            <label>${escapeHtml(field.label)}</label>
            ${deleteButton}
          </div>
          ${inputMarkup}
        </div>
      `;
    })
    .join('');

  const avatarMarkup = selectedCharacter.avatar
    ? `<img src="${selectedCharacter.avatar}" alt="Изображение ${escapeHtml(selectedCharacter.name)}" />`
    : `<span class="sheet-image-placeholder">📷<span>${isOwner ? 'Выбрать изображение' : 'Изображение отсутствует'}</span></span>`;

  const avatarBlock = isOwner
    ? `<button type="button" class="sheet-image" data-avatar-trigger>${avatarMarkup}</button>`
    : `<div class="sheet-image">${avatarMarkup}</div>`;

  const hasNote = Boolean(selectedCharacter.dmNote && selectedCharacter.dmNote.trim());
  const notebookBlock = `
    <div class="sheet-notebook">
      <button type="button" class="sheet-notebook-toggle" data-notebook-toggle>
        <span>📓 Заметка мастера (приватно)${hasNote ? '<span class="notebook-dot"></span>' : ''}</span>
        <span class="chevron">▾</span>
      </button>
      <div class="sheet-notebook-body hidden">
        ${isOwner
          ? `<textarea class="sheet-notebook-textarea" rows="3" placeholder="Видно только этому игроку и вам">${escapeHtml(selectedCharacter.dmNote || '')}</textarea>`
          : selectedCharacter.dmNote
            ? `<div class="sheet-notebook-readonly">${escapeHtml(selectedCharacter.dmNote)}</div>`
            : `<div class="sheet-notebook-readonly empty">Мастер пока не оставил вам заметок.</div>`}
      </div>
    </div>
  `;

  return `
    <article class="character-card">
      ${avatarBlock}
      <h4>${escapeHtml(selectedCharacter.name)}</h4>
      <div class="meta-row">
        <span>${escapeHtml(selectedCharacter.className)}</span>
        <span>${escapeHtml(selectedCharacter.role)}</span>
      </div>
      <div class="sheet-field">
        <label>Игрок</label>
        <input value="${escapeHtml(selectedCharacter.playerName)}" />
      </div>
      ${fields}
      ${notebookBlock}
    </article>
  `;
}

// БЛОК 13: список персонажей игрока для настроек
function getPlayerCharacters() {
  const currentRoom = rooms.find((room) => room.id === activeRoomId) || rooms[0];
  const isOwnerView = activeRole === 'owner' || currentRoom.role === 'owner';

  const characters = rooms.flatMap((room) => room.characters.filter((character) => {
    const matchesOwnerView = isOwnerView || character.playerName === userProfile.displayName || character.playerName === 'Вы';
    return isOwnerView ? true : matchesOwnerView;
  }));

  if (characters.length) {
    return characters;
  }

  return (rooms[0]?.characters || []).map((character) => ({ ...character }));
}

function seedAccountHistory() {
  if (userProfile.savedCampaigns.length || userProfile.chronicles.length) {
    return;
  }

  const firstRoom = rooms[0];
  const firstCharacter = firstRoom?.characters?.find((character) => character.playerName === 'Вы' || character.playerName === userProfile.displayName) || firstRoom?.characters?.[0];
  if (firstRoom && firstCharacter) {
    addSavedCampaignEntry(firstRoom, firstCharacter);
  }
}

// БЛОК: запись входа в кампанию — хранит ссылку на комнату, а не замороженный
// снимок чата, поэтому все сообщения и броски кубов, отправленные позже,
// тоже видны в истории при просмотре записи.
function addSavedCampaignEntry(room, character) {
  const now = new Date();
  const entry = {
    id: `${room.id}-${Date.now()}`,
    roomId: room.id,
    roomName: room.name,
    owner: room.owner,
    characterName: character?.name || 'Без героя',
    enteredAt: now.toLocaleString('ru-RU'),
    enteredAtIso: now.toISOString()
  };

  userProfile.savedCampaigns = [entry, ...userProfile.savedCampaigns].slice(0, 8);
  userProfile.chronicles = [entry, ...userProfile.chronicles].slice(0, 8);
}

// БЛОК: поиск записи хроники по id (для просмотра чата и скачивания)
function findChronicleEntry(id) {
  return userProfile.chronicles.find((entry) => entry.id === id)
    || userProfile.savedCampaigns.find((entry) => entry.id === id);
}

// БЛОК: текущие сообщения комнаты, к которой относится запись хроники
// (живые, а не зафиксированные на момент входа)
function getChronicleMessages(entry) {
  const room = rooms.find((item) => item.id === entry.roomId);
  return room ? room.messages : [];
}

// БЛОК: фильтрация хроник по выбранной дате
function getFilteredChronicles() {
  const filterValue = chronicleDateFilterEl?.value;
  if (!filterValue) return userProfile.chronicles;

  return userProfile.chronicles.filter((entry) => {
    if (!entry.enteredAtIso) return false;
    const entryDate = new Date(entry.enteredAtIso);
    const y = entryDate.getFullYear();
    const m = String(entryDate.getMonth() + 1).padStart(2, '0');
    const d = String(entryDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}` === filterValue;
  });
}

// БЛОК: открытие модального окна с историей чата (только для чтения)
function openChronicleChat(id) {
  const entry = findChronicleEntry(id);
  if (!entry || !chronicleChatModalEl) return;

  activeChronicleId = id;
  chronicleChatTitleEl.textContent = entry.roomName;
  chronicleChatMetaEl.textContent = `${entry.characterName} • ${entry.owner} • первый вход: ${entry.enteredAt}`;

  const messages = getChronicleMessages(entry);
  chronicleChatMessagesEl.innerHTML = messages.length
    ? messages
      .map((message) => `
        <div class="message ${message.self ? 'self' : ''}">
          <strong>${escapeHtml(message.author)}</strong>
          <span>${escapeHtml(message.text)}</span>
        </div>
      `)
      .join('')
    : '<div class="empty-state">В чате этой кампании пока нет сообщений.</div>';

  chronicleChatModalEl.classList.remove('hidden');
}

function closeChronicleChat() {
  chronicleChatModalEl.classList.add('hidden');
  activeChronicleId = null;
}

// БЛОК: подготовка текстового файла с историей чата для скачивания
function formatChronicleForDownload(entry) {
  const messages = getChronicleMessages(entry);
  const lines = [
    `Кампания: ${entry.roomName}`,
    `Владелец: ${entry.owner}`,
    `Персонаж: ${entry.characterName}`,
    `Первый вход: ${entry.enteredAt}`,
    '',
    ...(messages.length
      ? messages.map((message) => `${message.author}: ${message.text}`)
      : ['Сообщений нет.'])
  ];
  return lines.join('\n');
}

function downloadChronicleChat(id) {
  const entry = findChronicleEntry(id);
  if (!entry) return;

  const content = formatChronicleForDownload(entry);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = entry.roomName.replace(/[^a-zA-Zа-яА-Я0-9]+/g, '_');
  link.download = `chronicle_${safeName}_${entry.id}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderChronicles() {
  seedAccountHistory();

  const totalEntries = userProfile.chronicles.length;
  const savedCount = userProfile.savedCampaigns.length;

  if (campaignHistorySummaryEl) {
    campaignHistorySummaryEl.innerHTML = `
      <div class="summary-pills">
        <span class="summary-pill">Входов: ${totalEntries}</span>
        <span class="summary-pill">Сохранено: ${savedCount}</span>
      </div>
      <p>Здесь хранится история ваших возвращений в кампании: можно посмотреть чат на момент захода, скачать его или отфильтровать записи по дате.</p>
    `;
  }

  renderChroniclesList();

  if (!userProfile.savedCampaigns.length) {
    savedCampaignsListEl.innerHTML = '<div class="empty-state">Кампании ещё не сохранялись на аккаунте. Открытие любой комнаты добавит запись в список.</div>';
  } else {
    savedCampaignsListEl.innerHTML = userProfile.savedCampaigns
      .map((entry) => `
        <div class="profile-character-card">
          <div>
            <strong>${escapeHtml(entry.roomName)}</strong>
            <small>${escapeHtml(entry.characterName)} • ${escapeHtml(entry.owner)}</small>
          </div>
        </div>
      `)
      .join('');
  }
}

// БЛОК: отрисовка списка хроник (с учётом фильтра по дате) и её кнопок
function renderChroniclesList() {
  const list = getFilteredChronicles();

  if (!list.length) {
    chroniclesListEl.innerHTML = userProfile.chronicles.length
      ? '<div class="empty-state">На выбранную дату записей нет. Попробуйте другую дату или сбросьте фильтр.</div>'
      : '<div class="empty-state">Пока нет истории входов в кампании. Сначала откройте кампанию и пройдите один заход.</div>';
    return;
  }

  chroniclesListEl.innerHTML = list
    .map((entry) => `
      <div class="profile-character-card">
        <div>
          <strong>${escapeHtml(entry.roomName)}</strong>
          <small>${escapeHtml(entry.characterName)} • ${escapeHtml(entry.enteredAt)}</small>
        </div>
        <div class="profile-character-actions">
          <button type="button" class="button ghost small" data-action="view-chronicle-chat" data-chronicle-id="${entry.id}">Чат</button>
          <button type="button" class="button ghost small" data-action="download-chronicle" data-chronicle-id="${entry.id}">Скачать</button>
        </div>
      </div>
    `)
    .join('');

  chroniclesListEl.querySelectorAll('[data-action="view-chronicle-chat"]').forEach((button) => {
    button.addEventListener('click', () => openChronicleChat(button.dataset.chronicleId));
  });

  chroniclesListEl.querySelectorAll('[data-action="download-chronicle"]').forEach((button) => {
    button.addEventListener('click', () => downloadChronicleChat(button.dataset.chronicleId));
  });
}

// БЛОК 14: тема интерфейса — светлая или тёмная
function applyTheme(theme) {
  userProfile.theme = theme;
  document.body.dataset.theme = theme;
  themeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });
}

// БЛОК 15: обновление полей профиля и аватара
function updateProfileFields() {
  profileNameInputEl.value = userProfile.displayName;
  profilePasswordInputEl.value = userProfile.password;
  profileIpInputEl.value = userProfile.ip;
  profileEmailInputEl.value = userProfile.email;
  profileBioInputEl.value = userProfile.bio;
  googleStatusBadgeEl.textContent = userProfile.googleSignedIn ? 'Вход выполнен' : 'Не в сети';
  googleStatusBadgeEl.classList.toggle('accent', userProfile.googleSignedIn);
  googleSigninBtn.textContent = userProfile.googleSignedIn ? 'Выйти из Google' : 'Войти через Google';

  if (userProfile.avatar) {
    profileAvatarPreviewEl.innerHTML = `<img src="${userProfile.avatar}" alt="Аватар пользователя" />`;
  } else {
    profileAvatarPreviewEl.textContent = userProfile.displayName.charAt(0).toUpperCase() || 'А';
  }

  applyTheme(userProfile.theme);
}

// БЛОК 16: список персонажей в разделе настроек
function renderProfileCharacters() {
  const characters = getPlayerCharacters();
  if (!characters.length) {
    const fallbackRoom = rooms.find((room) => room.characters?.length) || rooms[0];
    const fallbackCharacter = fallbackRoom?.characters?.[0];

    if (fallbackCharacter) {
      profileCharacterListEl.innerHTML = `
        <div class="profile-character-card">
          <div>
            <strong>${escapeHtml(fallbackCharacter.name)}</strong>
            <small>${escapeHtml(fallbackCharacter.className)} • ${escapeHtml(fallbackCharacter.role)}</small>
          </div>
          <div class="profile-character-actions">
            <button type="button" class="button ghost small" data-action="open" data-character-id="${fallbackCharacter.id}" data-room-id="${fallbackRoom.id}">Открыть</button>
          </div>
        </div>
      `;
      return;
    }

    profileCharacterListEl.innerHTML = `
      <div class="empty-state">
        У вас ещё нет созданных персонажей.<br />
        Добавьте первого героя, чтобы он появился здесь.
      </div>
    `;
    return;
  }

  profileCharacterListEl.innerHTML = characters
    .map((character) => {
      const room = rooms.find((roomItem) => roomItem.characters.some((item) => item.id === character.id));
      return `
        <div class="profile-character-card">
          <div>
            <strong>${escapeHtml(character.name)}</strong>
            <small>${escapeHtml(character.className)} • ${escapeHtml(character.role)}</small>
          </div>
          <div class="profile-character-actions">
            <button type="button" class="button ghost small" data-action="open" data-character-id="${character.id}" data-room-id="${room?.id}">Открыть</button>
            <button type="button" class="button ghost small" data-action="delete" data-character-id="${character.id}" data-room-id="${room?.id}">Удалить</button>
          </div>
        </div>
      `;
    })
    .join('');

  profileCharacterListEl.querySelectorAll('[data-action="open"]').forEach((button) => {
    button.addEventListener('click', () => {
      const roomId = Number(button.dataset.roomId);
      const characterId = button.dataset.characterId;
      const room = rooms.find((item) => item.id === roomId);
      if (!room) return;
      activeRoomId = room.id;
      activeRole = room.role;
      activeCharacterByRoom[room.id] = characterId;
      addSavedCampaignEntry(room, room.characters.find((character) => character.id === characterId));
      updateRoleButtons();
      render();
      setActiveView('campaign');
    });
  });

  profileCharacterListEl.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => {
      const roomId = Number(button.dataset.roomId);
      const characterId = button.dataset.characterId;
      const room = rooms.find((item) => item.id === roomId);
      if (!room) return;
      room.characters = room.characters.filter((character) => character.id !== characterId);
      if (activeCharacterByRoom[room.id] === characterId) {
        activeCharacterByRoom[room.id] = room.characters[0]?.id || null;
      }
      render();
      renderProfileCharacters();
      renderChronicles();
    });
  });
}

// Обновление экрана настроек: профиль, аватар и список персонажей
// БЛОК 17: объединение всех элементов настроек на страницу
// БЛОК 17: объединение всех элементов настроек на страницу
function renderSettingsView() {
  updateProfileFields();
}

// БЛОК 18: форма добавления нового персонажа
// БЛОК 18: форма добавления нового персонажа
function toggleNewCharacterForm(show) {
  newCharacterFormEl.classList.toggle('hidden', !show);
  if (show) {
    newCharacterNameInputEl.focus();
  } else {
    newCharacterNameInputEl.value = '';
    newCharacterRoleInputEl.value = '';
    newCharacterClassInputEl.value = '';
  }
}

function setActiveView(view) {
  activeView = view;
  const isCampaign = view === 'campaign';
  const isCharacters = view === 'characters';
  const isChronicles = view === 'chronicles';
  const isSettings = view === 'settings';
  const isHome = view === 'home';

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view || (view === 'home' && button.dataset.view === 'home'));
  });

  homeViewEl.classList.toggle('hidden', !isHome);
  campaignViewEl.classList.toggle('hidden', !isCampaign);
  charactersViewEl.classList.toggle('hidden', !isCharacters);
  chroniclesViewEl.classList.toggle('hidden', !isChronicles);
  settingsViewEl.classList.toggle('hidden', !isSettings);
  sidebarActionsEl.classList.toggle('hidden', !isCampaign);

  if (isCharacters) {
    renderProfileCharacters();
  }

  if (isChronicles) {
    renderChronicles();
  }

  if (isSettings) {
    renderSettingsView();
  }
}

// БЛОК 18а: блокнот мастера на главной — кликабельный, сохраняет текст между открытиями
function renderHomeNotes() {
  const viewEl = document.getElementById('home-notes-view');
  const toggleEl = document.getElementById('home-notes-toggle');
  if (!viewEl) return;

  if (homeNotesEditing) {
    viewEl.innerHTML = `<textarea id="home-notes-textarea" class="home-notes-textarea" placeholder="Пишите сюда — заметки сохраняются, пока открыта страница">${escapeHtml(homeMasterNotes)}</textarea>`;
    const textarea = document.getElementById('home-notes-textarea');
    textarea.addEventListener('input', (event) => {
      homeMasterNotes = event.target.value;
    });
    textarea.focus();
    if (toggleEl) toggleEl.textContent = 'Сохранить';
    return;
  }

  const lines = homeMasterNotes.split('\n').map((line) => line.trim()).filter(Boolean);
  viewEl.innerHTML = lines.length
    ? `<ul class="notes-list">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`
    : '<div class="empty-state">Заметок пока нет — нажмите «Редактировать», чтобы добавить.</div>';
  if (toggleEl) toggleEl.textContent = 'Редактировать';
}

// БЛОК 18б: «Портрет группы» на главной — реальные аватары персонажей текущей
// кампании; клик по аве переносит мастера в ширму этого персонажа.
function renderGroupPortrait() {
  const groupAvatarStackEl = document.getElementById('group-avatar-stack');
  if (!groupAvatarStackEl) return;

  const room = rooms.find((item) => item.id === activeRoomId) || rooms[0];
  if (!room) return;

  const roster = getRoomRosterEntries(room);
  if (!roster.length) {
    groupAvatarStackEl.innerHTML = '<p class="muted">В этой комнате пока нет персонажей.</p>';
    return;
  }

  const isRoomOwnerView = room.role === 'owner';

  groupAvatarStackEl.innerHTML = roster
    .map((entry) => {
      const isClickable = isRoomOwnerView;
      const avatarInner = entry.avatar
        ? `<img src="${entry.avatar}" alt="" />`
        : escapeHtml((entry.displayName || '?').charAt(0).toUpperCase());
      const clickableAttrs = isClickable ? `data-goto-character="${entry.id}" role="button" tabindex="0"` : '';
      return `<div class="avatar ${isClickable ? 'clickable' : ''}" ${clickableAttrs} title="${escapeHtml(entry.displayName)}">${avatarInner}</div>`;
    })
    .join('');

  groupAvatarStackEl.querySelectorAll('[data-goto-character]').forEach((element) => {
    const goToCharacterSheet = () => {
      const characterId = element.dataset.gotoCharacter;
      activeRoomId = room.id;
      activeRole = 'owner';
      activeCharacterByRoom[room.id] = characterId;
      updateRoleButtons();
      sheetPinned = true;
      updateSheetState();
      setActiveView('campaign');
      render();
    };

    element.addEventListener('click', goToCharacterSheet);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goToCharacterSheet();
      }
    });
  });
}

// БЛОК 19: общая перерисовка интерфейса после изменений
function render() {
  const room = rooms.find((item) => item.id === activeRoomId) || rooms[0];
  roomTitleEl.textContent = room.name;
  roomMetaEl.textContent = `Владелец: ${room.owner} • ${room.participants.length + 1} участника`;
  participantsPillEl.textContent = `${room.participants.length + 1} участника`;
  updateSheetControls();
  renderMessages(room);
  renderSheet(room);
  renderRooms();
  renderProfileCharacters();
  renderChronicles();
  renderGroupPortrait();
}

// БЛОК 20: обработчики событий интерфейса — чат, кубы, ширма, настройки и создание комнат
messageFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInputEl.value.trim();
  if (!text) return;

  const room = rooms.find((item) => item.id === activeRoomId);
  if (!room) return;

  room.messages.push({ author: 'Вы', text, self: true });
  messageInputEl.value = '';
  renderMessages(room);
});

diceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const sides = button.dataset.sides;
    const result = rollDiceFormula(`1d${sides}`);
    if (!result) return;
    addDiceMessage(`d${sides}`, result);
  });
});

rollCustomBtnEl.addEventListener('click', () => {
  performCustomRoll();
});

diceCustomInputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    performCustomRoll();
  }
});

sheetToggleBtnEl.addEventListener('click', () => {
  sheetPinned = !sheetPinned;
  updateSheetState();
});

addImageBtnEl.addEventListener('click', () => {
  if (activeRole !== 'owner') return;

  const room = rooms.find((item) => item.id === activeRoomId);
  const selectedCharacter = room ? getActiveRealCharacter(room) : null;
  if (!selectedCharacter) return;
  avatarInputEl.click();
});

addFieldBtnEl.addEventListener('click', () => {
  if (activeRole !== 'owner') return;

  const room = rooms.find((item) => item.id === activeRoomId);
  const selectedCharacter = room ? getActiveRealCharacter(room) : null;
  if (!selectedCharacter) return;

  selectedCharacter.fields.push({ label: 'Новое поле', value: '', type: 'text' });
  renderSheet(room);
});

roleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeRole = button.dataset.role;
    updateRoleButtons();
    const room = rooms.find((item) => item.id === activeRoomId);
    if (room) {
      updateSheetControls();
      renderSheet(room);
    }
  });
});

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveView(button.dataset.view);
  });
});

googleSigninBtn.addEventListener('click', () => {
  if (userProfile.googleSignedIn) {
    userProfile.googleSignedIn = false;
    userProfile.email = '';
    updateProfileFields();
    renderSettingsView();
    return;
  }

  const email = window.prompt('Введите email Google для входа', 'ivan@example.com');
  if (!email) return;

  userProfile.googleSignedIn = true;
  userProfile.email = email.trim();
  updateProfileFields();
  renderSettingsView();
});

profileNameInputEl.addEventListener('input', (event) => {
  const oldName = userProfile.displayName;
  const newName = event.target.value.trim() || 'Вы';
  userProfile.displayName = newName;
  rooms.forEach((room) => {
    room.characters.forEach((character) => {
      if (character.playerName === oldName) {
        character.playerName = newName;
      }
    });
  });
  renderSettingsView();
});

profilePasswordInputEl.addEventListener('input', (event) => {
  userProfile.password = event.target.value;
});

profileIpInputEl.addEventListener('input', (event) => {
  userProfile.ip = event.target.value;
});

profileBioInputEl.addEventListener('input', (event) => {
  userProfile.bio = event.target.value;
});

profileAvatarBtnEl.addEventListener('click', () => {
  profileAvatarInputEl.click();
});

profileAvatarInputEl.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    userProfile.avatar = reader.result;
    updateProfileFields();
  };
  reader.readAsDataURL(file);
  event.target.value = '';
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyTheme(button.dataset.theme);
  });
});

addProfileCharacterBtnEl.addEventListener('click', () => {
  toggleNewCharacterForm(true);
});

cancelNewCharacterBtnEl.addEventListener('click', () => {
  toggleNewCharacterForm(false);
});

saveNewCharacterBtnEl.addEventListener('click', () => {
  const name = newCharacterNameInputEl.value.trim();
  const role = newCharacterRoleInputEl.value.trim() || 'Игрок';
  const className = newCharacterClassInputEl.value.trim() || 'Персонаж';
  if (!name) return;

  const room = rooms.find((item) => item.id === activeRoomId) || rooms[0];
  const newCharacter = {
    id: `char-${Date.now()}`,
    playerName: userProfile.displayName,
    name,
    role,
    className,
    avatar: '',
    dmNote: '',
    fields: [
      { label: 'Раса', value: 'Не указана', type: 'text' },
      { label: 'Возраст', value: '', type: 'text' },
      { label: 'Снаряжение', value: '', type: 'textarea' }
    ]
  };

  room.characters.push(newCharacter);
  activeCharacterByRoom[room.id] = newCharacter.id;
  toggleNewCharacterForm(false);
  render();
  renderProfileCharacters();
  renderChronicles();
});

leaveCampaignBtnEl.addEventListener('click', () => {
  const room = rooms.find((item) => item.id === activeRoomId);
  if (!room) return;
  const selectedCharacter = room ? getActiveRealCharacter(room) : null;
  if (selectedCharacter) {
    addSavedCampaignEntry(room, selectedCharacter);
  }
  setActiveView('home');
});

openCampaignBtn.addEventListener('click', () => {
  setActiveView('campaign');
});

openCampaignButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveView('campaign');
  });
});

function renderParticipantPicker() {
  if (!participantPickerListEl) return;
  participantPickerListEl.innerHTML = DEMO_PLAYER_POOL
    .map((name) => `
      <label class="participant-picker-item">
        <input type="checkbox" name="participant" value="${escapeHtml(name)}" />
        <span>${escapeHtml(name)}</span>
      </label>
    `)
    .join('');
}

createRoomBtn.addEventListener('click', () => {
  if (modalOwnerNameEl) {
    modalOwnerNameEl.textContent = userProfile.displayName;
  }
  renderParticipantPicker();
  modalBackdrop.classList.remove('hidden');
});

cancelRoomBtn.addEventListener('click', () => {
  modalBackdrop.classList.add('hidden');
});

modalBackdrop.addEventListener('click', (event) => {
  if (event.target === modalBackdrop) {
    modalBackdrop.classList.add('hidden');
  }
});

if (chronicleChatCloseEl) {
  chronicleChatCloseEl.addEventListener('click', () => {
    closeChronicleChat();
  });
}

if (chronicleChatModalEl) {
  chronicleChatModalEl.addEventListener('click', (event) => {
    if (event.target === chronicleChatModalEl) {
      closeChronicleChat();
    }
  });
}

if (chronicleDownloadBtnEl) {
  chronicleDownloadBtnEl.addEventListener('click', () => {
    if (activeChronicleId) {
      downloadChronicleChat(activeChronicleId);
    }
  });
}

if (chronicleDateFilterEl) {
  chronicleDateFilterEl.addEventListener('change', () => {
    renderChroniclesList();
  });
}

if (chronicleDateResetEl) {
  chronicleDateResetEl.addEventListener('click', () => {
    chronicleDateFilterEl.value = '';
    renderChroniclesList();
  });
}

roomForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(roomForm);
  const roomName = formData.get('roomName')?.toString().trim();
  const ownerName = userProfile.displayName;
  const participants = formData.getAll('participant').map((value) => value.toString());

  if (!roomName) return;

  const newRoom = {
    id: Date.now(),
    name: roomName,
    owner: ownerName,
    participants,
    role: 'owner',
    messages: [],
    characters: [
      {
        id: `char-${Date.now()}`,
        playerName: ownerName,
        name: ownerName,
        role: 'Мастер',
        className: 'Ведущий',
        avatar: '',
        dmNote: '',
        fields: [
          { label: 'Заметки', value: 'Контролирует сцену и тайны', type: 'textarea' }
        ]
      }
    ]
  };

  rooms.unshift(newRoom);
  activeRoomId = newRoom.id;
  activeRole = 'owner';
  updateRoleButtons();
  roomForm.reset();
  modalBackdrop.classList.add('hidden');
  setActiveView('campaign');
  render();
});

const homeNotesToggleEl = document.getElementById('home-notes-toggle');
if (homeNotesToggleEl) {
  homeNotesToggleEl.addEventListener('click', () => {
    homeNotesEditing = !homeNotesEditing;
    renderHomeNotes();
  });
}

seedAccountHistory();
updateSheetState();
applyTheme(userProfile.theme);
setActiveView('home');
renderHomeNotes();
render();

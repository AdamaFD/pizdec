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

// БЛОК 1: управление кнопками ширмы в зависимости от роли
function updateSheetControls() {
  const isOwner = activeRole === 'owner';
  addImageBtnEl.style.display = isOwner ? 'inline-flex' : 'none';
  addFieldBtnEl.style.display = isOwner ? 'inline-flex' : 'none';
  addImageBtnEl.parentElement.style.display = isOwner ? 'flex' : 'none';
}

// БЛОК 2: список комнат и переключение между комнатами
function renderRooms() {
  roomListEl.innerHTML = '';

  rooms.forEach((room) => {
    const button = document.createElement('button');
    button.className = `room-item ${room.id === activeRoomId ? 'active' : ''}`;
    button.innerHTML = `
      <strong>${room.name}</strong>
      <p>${room.owner} • ${room.participants.length + 1} в сети</p>
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
  const match = value.match(/^(?:(\d+)d)?(\d+)(?:([+-]\d+))?$/);

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
function addDiceMessage(expression, result) {
  const room = rooms.find((item) => item.id === activeRoomId);
  if (!room) return;

  const summary = `${expression} → ${result.rolls.join(', ')} = ${result.total}`;
  room.messages.push({ author: 'Вы', text: `🎲 ${summary}`, self: true });
  renderMessages(room);
}

function setActiveView(view) {
  activeView = view;
  const isCampaign = view === 'campaign';
  const isHome = view === 'home' || view === 'characters' || view === 'chronicles' || view === 'settings';

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view || (isHome && button.dataset.view === 'home'));
  });

  homeViewEl.classList.toggle('hidden', !isHome);
  campaignViewEl.classList.toggle('hidden', !isCampaign);
  sidebarActionsEl.classList.toggle('hidden', !isCampaign);
}

// БЛОК 8: вывод сообщений чата
function renderMessages(room) {
  chatMessagesEl.innerHTML = '';

  room.messages.forEach((message) => {
    const item = document.createElement('div');
    item.className = `message ${message.self ? 'self' : ''}`;
    item.innerHTML = `
      <strong>${message.author}</strong>
      <span>${message.text}</span>
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

// БЛОК 11: обработчики для ширмы: выбор персонажа, аватар и поля
function bindSheetInteractions(room, selectedCharacter) {
  const characterButtons = sheetContentEl.querySelectorAll('[data-character-id]');
  characterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCharacterByRoom[room.id] = button.dataset.characterId;
      renderSheet(room);
    });
  });

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
}

// БЛОК 12: отрисовка содержимого ширмы персонажа
function renderSheet(room) {
  const isOwner = activeRole === 'owner';
  const visibleCharacters = getVisibleCharacters(room);
  const selectedCharacter = getSelectedCharacter(room);

  sheetRoleBadgeEl.textContent = isOwner ? 'Все персонажи' : 'Только мой';

  if (!visibleCharacters.length || !selectedCharacter) {
    sheetContentEl.innerHTML = '<div class="empty-state">У вас пока нет доступных персонажей в этой сцене.</div>';
    return;
  }

  const characterList = isOwner
    ? `
      <div class="sheet-character-list">
        ${room.characters
          .map(
            (character) => `
              <button type="button" class="sheet-character-item ${character.id === selectedCharacter.id ? 'active' : ''}" data-character-id="${character.id}">
                <strong>${character.playerName} / ${character.name}</strong>
                <small>${character.role}</small>
              </button>
            `
          )
          .join('')}
      </div>
    `
    : '';

  const fields = selectedCharacter.fields
    .map((field, index) => {
      const inputMarkup = field.type === 'textarea'
        ? `<textarea class="sheet-field-textarea" rows="3">${field.value}</textarea>`
        : `<input class="sheet-field-input" value="${field.value}" />`;

      return `
        <div class="sheet-field">
          <label>${field.label}</label>
          ${inputMarkup}
        </div>
      `;
    })
    .join('');

  const avatarMarkup = selectedCharacter.avatar
    ? `<img src="${selectedCharacter.avatar}" alt="Изображение ${selectedCharacter.name}" />`
    : `<span class="sheet-image-placeholder">📷<span>${isOwner ? 'Выбрать изображение' : 'Изображение отсутствует'}</span></span>`;

  const avatarBlock = isOwner
    ? `<button type="button" class="sheet-image" data-avatar-trigger>${avatarMarkup}</button>`
    : `<div class="sheet-image">${avatarMarkup}</div>`;

  sheetContentEl.innerHTML = `
    <div class="sheet-list">
      ${characterList}
      <article class="character-card">
        ${avatarBlock}
        <h4>${selectedCharacter.name}</h4>
        <div class="meta-row">
          <span>${selectedCharacter.className}</span>
          <span>${selectedCharacter.role}</span>
        </div>
        <div class="sheet-field">
          <label>Игрок</label>
          <input value="${selectedCharacter.playerName}" />
        </div>
        ${fields}
      </article>
    </div>
  `;

  bindSheetInteractions(room, selectedCharacter);
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

function addSavedCampaignEntry(room, character) {
  const entry = {
    id: `${room.id}-${Date.now()}`,
    roomName: room.name,
    owner: room.owner,
    characterName: character?.name || 'Без героя',
    enteredAt: new Date().toLocaleString('ru-RU')
  };

  userProfile.savedCampaigns = [entry, ...userProfile.savedCampaigns].slice(0, 8);
  userProfile.chronicles = [entry, ...userProfile.chronicles].slice(0, 8);
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
      <p>Здесь хранится история ваших возвращений в кампании, а также список комнат, к которым вы возвращались с любимым героем.</p>
    `;
  }

  if (!userProfile.chronicles.length) {
    chroniclesListEl.innerHTML = '<div class="empty-state">Пока нет истории входов в кампании. Сначала откройте кампанию и пройдите один заход.</div>';
  } else {
    chroniclesListEl.innerHTML = userProfile.chronicles
      .map((entry) => `
        <div class="profile-character-card">
          <div>
            <strong>${entry.roomName}</strong>
            <small>${entry.characterName} • ${entry.enteredAt}</small>
          </div>
        </div>
      `)
      .join('');
  }

  if (!userProfile.savedCampaigns.length) {
    savedCampaignsListEl.innerHTML = '<div class="empty-state">Кампании ещё не сохранялись на аккаунте. Открытие любой комнаты добавит запись в список.</div>';
  } else {
    savedCampaignsListEl.innerHTML = userProfile.savedCampaigns
      .map((entry) => `
        <div class="profile-character-card">
          <div>
            <strong>${entry.roomName}</strong>
            <small>${entry.characterName} • ${entry.owner}</small>
          </div>
        </div>
      `)
      .join('');
  }
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
            <strong>${fallbackCharacter.name}</strong>
            <small>${fallbackCharacter.className} • ${fallbackCharacter.role}</small>
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
            <strong>${character.name}</strong>
            <small>${character.className} • ${character.role}</small>
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

// БЛОК 19: общая перерисовка интерфейса после изменений
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
  const expression = diceCustomInputEl.value.trim();
  if (!expression) return;

  const result = rollDiceFormula(expression);
  if (!result) {
    const room = rooms.find((item) => item.id === activeRoomId);
    if (!room) return;
    room.messages.push({ author: 'Система', text: 'Формат куба не распознан. Попробуй: d20, 2d10, 3d6+2', self: false });
    renderMessages(room);
    return;
  }

  addDiceMessage(expression, result);
  diceCustomInputEl.value = '';
});

sheetToggleBtnEl.addEventListener('click', () => {
  sheetPinned = !sheetPinned;
  updateSheetState();
});

addImageBtnEl.addEventListener('click', () => {
  if (activeRole !== 'owner') return;

  const room = rooms.find((item) => item.id === activeRoomId);
  const selectedCharacter = room ? getSelectedCharacter(room) : null;
  if (!selectedCharacter) return;
  avatarInputEl.click();
});

addFieldBtnEl.addEventListener('click', () => {
  if (activeRole !== 'owner') return;

  const room = rooms.find((item) => item.id === activeRoomId);
  const selectedCharacter = room ? getSelectedCharacter(room) : null;
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
  const selectedCharacter = room ? getSelectedCharacter(room) : null;
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

createRoomBtn.addEventListener('click', () => {
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

roomForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(roomForm);
  const roomName = formData.get('roomName')?.toString().trim();
  const ownerName = formData.get('ownerName')?.toString().trim();
  const participants = formData.get('participants')?.toString().split(',').map((name) => name.trim()).filter(Boolean) || [];

  if (!roomName || !ownerName) return;

  const newRoom = {
    id: Date.now(),
    name: roomName,
    owner: ownerName,
    participants,
    role: 'owner',
    messages: [
      { author: ownerName, text: 'Комната создана. Начинаем сцену.', self: false },
      { author: 'Вы', text: 'Я уже готов к первому ходу.', self: true }
    ],
    characters: [
      { name: ownerName, role: 'Мастер', className: 'Ведущий', notes: 'Контролирует сцену и тайны' }
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

seedAccountHistory();
updateSheetState();
applyTheme(userProfile.theme);
setActiveView('home');
render();

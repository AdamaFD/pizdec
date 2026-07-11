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
const googleSigninBtn = document.getElementById('google-signin-btn');
const googleStatusBadgeEl = document.getElementById('google-status-badge');
const profileNameInputEl = document.getElementById('profile-name-input');
const profileEmailInputEl = document.getElementById('profile-email-input');
const profileBioInputEl = document.getElementById('profile-bio-input');
const profileCharacterListEl = document.getElementById('profile-character-list');
const addProfileCharacterBtnEl = document.getElementById('add-profile-character-btn');
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
  email: '',
  bio: 'Ведущий приключений'
};

function updateSheetControls() {
  const isOwner = activeRole === 'owner';
  addImageBtnEl.style.display = isOwner ? 'inline-flex' : 'none';
  addFieldBtnEl.style.display = isOwner ? 'inline-flex' : 'none';
  addImageBtnEl.parentElement.style.display = isOwner ? 'flex' : 'none';
}

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

function updateRoleButtons() {
  roleButtons.forEach((button) => {
    const isActive = button.dataset.role === activeRole;
    button.classList.toggle('active', isActive);
  });
}

function updateSheetState() {
  sheetRailEl.classList.toggle('open', sheetPinned);
  document.querySelector('.workspace-grid').classList.toggle('open-sheet', sheetPinned);
}

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

function getVisibleCharacters(room) {
  if (activeRole === 'owner') {
    return room.characters;
  }

  return room.characters.filter((character) => character.playerName === 'Вы');
}

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
    : `<span class="sheet-image-placeholder">📷<span>${isOwner ? 'Выбрать изображение' : 'Изображение недоступно'}</span></span>`;

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

function getPlayerCharacters() {
  return rooms.flatMap((room) => room.characters.filter((character) => character.playerName === userProfile.displayName));
}

function updateProfileFields() {
  profileNameInputEl.value = userProfile.displayName;
  profileEmailInputEl.value = userProfile.email;
  profileBioInputEl.value = userProfile.bio;
  googleStatusBadgeEl.textContent = userProfile.googleSignedIn ? 'Вход выполнен' : 'Не в сети';
  googleStatusBadgeEl.classList.toggle('accent', userProfile.googleSignedIn);
  googleSigninBtn.textContent = userProfile.googleSignedIn ? 'Выйти из Google' : 'Войти через Google';
}

function renderProfileCharacters() {
  const characters = getPlayerCharacters();
  if (!characters.length) {
    profileCharacterListEl.innerHTML = '<div class="empty-state">У вас ещё нет созданных персонажей.</div>';
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
      renderSettingsView();
    });
  });
}

function renderSettingsView() {
  updateProfileFields();
  renderProfileCharacters();
}

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
  const isSettings = view === 'settings';
  const isHome = view === 'home';

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  homeViewEl.classList.toggle('hidden', !isHome);
  campaignViewEl.classList.toggle('hidden', !isCampaign);
  settingsViewEl.classList.toggle('hidden', !isSettings);
  sidebarActionsEl.classList.toggle('hidden', !isCampaign);
  if (isSettings) {
    renderSettingsView();
  }
}

function render() {
  const room = rooms.find((item) => item.id === activeRoomId) || rooms[0];
  roomTitleEl.textContent = room.name;
  roomMetaEl.textContent = `Владелец: ${room.owner} • ${room.participants.length + 1} участника`;
  participantsPillEl.textContent = `${room.participants.length + 1} участника`;
  updateSheetControls();
  renderMessages(room);
  renderSheet(room);
  renderRooms();
}

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

profileBioInputEl.addEventListener('input', (event) => {
  userProfile.bio = event.target.value;
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
  renderSettingsView();
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

updateSheetState();
setActiveView('home');
render();

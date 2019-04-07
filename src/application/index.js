const positionComponent = document.querySelector('[data-component="position"]');
positionComponent.innerHTML = '0 / 0';
const firstNameComponent = document.querySelector('[data-component="first-name"]');
firstNameComponent.innerHTML = 'Имя';
const middleNameComponent = document.querySelector('[data-component="middle-name"]');
middleNameComponent.innerHTML = 'Отчество';
const input = document.querySelector('[data-component="input"]');
const containerInputPage = document.querySelector('.container-input-page');
const topContainer = document.querySelector('.top-container');
const inputPage = document.querySelector('[data-component="page"]');
const checkbox = document.querySelector('.checkbox');
const pdfContainer = document.querySelector('.pdf-container');
const sendedElem = document.querySelector('.sended-count');
const arrowCountLeft = document.querySelector('.arrow-count-left');
const arrowCountRight = document.querySelector('.arrow-count-right');
const checkboxAddComment = document.querySelector('.checkbox-add-comment');
const addCommentDescribe = document.querySelector('.add-comment-describe');
const allEmail = document.querySelector('.all-email');
const notSendedRemoveButton = document.querySelector('.not-sended-content__remove');
const notSendedSendButton = document.querySelector('.not-sended-content__send');
const sendNotSendedButton = document.querySelector('.send-not-sended-button');
const isConnect = document.querySelector('.is-connect');
const isChangePos = document.querySelector('.is-change-pos');
const isEndMailing = document.querySelector('.is-end-mailing');
const sendedCountEmailInput = document.querySelector('.sended-count-email-input');
const sendedCountEmail = document.querySelector('.sended-count-email');
const sendedCountEmailButton = document.querySelector('.sended-count-email-button');
const currentEmailInput = document.querySelector('.current-email');


const date = new Date();

const getDateFormat = (value) => {
  if (value > 9) {
    return value;
  }
  return `0${value}`;
};

const templateMain = `${getDateFormat(date.getDate())}\/${getDateFormat(date.getMonth() + 1)}\/${date.getFullYear()} Икона алтарь`;
const commentByEmail = 'НЕ ДОШЛО';
const hookMain = 'https://b24-2iruy0.bitrix24.ua/rest/1/nyvcvifbbajtkvh3';



let id = null;
let comment = null;
let sendedCount = 0;
let emailSendedCount = parseInt(sendedCountEmail.textContent, 10);
let isSended = false;
let lastCurrentPage = null;
let lastRequesrData = null;
let isPanding = false;
let jsonText = null;
let index = null;
let jsonLength = null;
let lastIndex = null;
let saveLastPos = true;
const arr = ['email', 'theme', 'body'];
const text = document.querySelector('[data-component="text"]');


let currentIndex = null;
const backlightPage = (page) => {
  if (inputPage.value !== page) {
    containerInputPage.classList.add('active');
  } else {
    containerInputPage.classList.remove('active');
  }
};

const sliceEmail = ({ emailString }) => {
  const email = emailString
    .split(',')
    .splice(0, 3);

  return email.join(',');
};

const getLocalStorage = () => {
  const storage = localStorage.getItem('Статистика');

  if (!storage) {
    const statistic = {
      'Последняя отправка': {},
      'Всего отправлено': 0,
      'Всего не отправлено': 0,
      'Всего не дошло': 0,
      'Не отправленные': [],
      'Отправленные': [],
      'Не дошедшие': [],
      'Подтверждение не отправлено': [],
      'Осталось отправить': parseInt(sendedCountEmail.textContent, 10),
      'Последний email': '',
    };

    localStorage.setItem('Статистика', JSON.stringify(statistic));
    return JSON.parse(localStorage.getItem('Статистика'));
  }

  return JSON.parse(storage);
};

const setLocalStorage = (statistics) => {
  localStorage.setItem('Статистика', JSON.stringify(statistics));
};

const removeNotConfirm = ({ id }) => {
  const statistics = getLocalStorage();
  const confirm = statistics['Подтверждение не отправлено'];
  let removeIndex = null;

  confirm.forEach((item, i) => {
    if (item.id === id) {
      removeIndex = i;
    }
  });
  confirm.splice(removeIndex, 1);
  statistics['Подтверждение не отправлено'] = confirm;
  setLocalStorage(statistics);
};

const moveSendedPos = ({ id, to }) => {
  const statistics = getLocalStorage();
  let pos = null;
  statistics['Отправленные'].forEach((item, i) => {
    if (item.id === id) {
      pos = statistics['Отправленные'].splice(i, 1);
    }
  });
  statistics[to].push(pos);
  setLocalStorage(statistics);
};

const changeEmailCount = ({ inc }) => {
  emailSendedCount += inc;
  sendedCountEmail.textContent = emailSendedCount;

  if (emailSendedCount <= 0) {
    isEndMailing.classList.add('blue');
  }

  const statistics = getLocalStorage();
  statistics['Осталось отправить'] = parseInt(sendedCountEmail.textContent, 10);
  setLocalStorage(statistics);

  if (emailSendedCount <= 0) {
    isEndMailing.classList.add('blue');
  } else {
    isEndMailing.classList.remove('blue');
  }
};


const sendComment = ({ comment }) => {
  // let data = {
  //   order: { DATE_CREATE: 'ASC' },
  //   filter: { ID: id },
  //   select: ['COMMENTS', 'ID'],
  // };

  // fetch('https://b24-2iruy0.bitrix24.ua/rest/1/nyvcvifbbajtkvh3/crm.company.list', {
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(data),
  // })
  //   .then(response => response.json())
  //   .then((json) => {
  //     console.log(json);
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   });

  return new Promise((resolve, reject) => {
    const data = {
      id,
      fields:
      {
        COMMENTS: comment,
      },
    };
    fetch(`${hookMain}/crm.company.update`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then((json) => {
        resolve();
        console.log(json);
      })
      .catch((e) => {
        reject();
        console.log(e);
      });
  });
};

const httpRequest = (data) => {
  const promise = new Promise((resolve) => {
    data.notCreatePDF = checkbox.checked;
    lastRequesrData = data;
    console.log(data);
    fetch('http://localhost:3000/application', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        const json = response.json();
        return json;
      })
      .then((json) => {
        notSendedRemoveButton.classList.add('hidden');
        notSendedSendButton.classList.add('hidden');
        const buttonNotSendedPos = document.querySelector('.not-sended-content__button-pos.active');

        if (buttonNotSendedPos) {
          buttonNotSendedPos.classList.remove('active');
        }

        console.log(json);
        id = json.id;
        comment = json.comment;

        if (json.isPanding || json.index === undefined) {
          isPanding = true;
          isConnect.classList.remove('green');
          if (lastRequesrData) {
            setTimeout(() => {
              httpRequest(lastRequesrData)
                .then(() => {
                  resolve();
                });
            }, 200);
          }
          return;
        }

        if (lastIndex !== json.index + 1 && lastIndex !== null) { // индикация смены позиции
          isChangePos.classList.add('yellow');
          setTimeout(() => {
            isChangePos.classList.remove('yellow');
          }, 1000);
        }
        isConnect.classList.add('green');
        isPanding = false;

        if (lastCurrentPage !== null && lastCurrentPage !== json.currentPage && json.currentPage !== undefined) {
          lastCurrentPage = json.currentPage;
          lastRequesrData = { pos: 1 };
          httpRequest({ pos: 1 });
          sendNotSendedButton.classList.remove('hidden');
          resolve();
          return;
        }
        currentIndex = json.index + 1;
        isSended = false;
        backlightPage(json.currentPage);

        if (json.notSend) {
          topContainer.classList.add('red');
          topContainer.classList.remove('green');
        } else {
          topContainer.classList.remove('red');
          topContainer.classList.remove('green');
        }

        if (lastIndex === jsonLength && currentIndex !== jsonLength - 1 && jsonLength !== null && data.move === 'next') {
          topContainer.classList.add('green');
          isChangePos.classList.add('yellow');
          setTimeout(() => {
            isChangePos.classList.remove('yellow');
          }, 1000);
        }

        jsonLength = json.length;
        lastIndex = json.index + 1;
        positionComponent.innerHTML = `${json.index + 1} / ${json.length}`;
        firstNameComponent.innerHTML = json.firstName;
        middleNameComponent.innerHTML = json.middleName;

        jsonText = json.text;
        index = 0;
        // const content = jsonText[arr[index]];
        const content = sliceEmail({ emailString: jsonText[arr[index]] });

        text.innerHTML = content;
        allEmail.innerHTML = jsonText[arr[0]];
        index += 1;
        text.classList.remove('sended');
        lastCurrentPage = json.currentPage;
        sendNotSendedButton.classList.remove('hidden');
        resolve();
      })
      .catch((e) => {
        isConnect.classList.remove('green');
        console.log(e);
      });
  });

  return promise;
};

httpRequest({ pos: 1 });

const onNext = () => {
  if (isPanding) {
    return;
  }
  saveLastPos = true;
  httpRequest({ move: 'next' });
};
const next = document.querySelector('[data-component="next"]');
next.addEventListener('click', onNext);

const onPrev = () => {
  if (isPanding) {
    return;
  }
  saveLastPos = true;
  httpRequest({ move: 'prev' });
};
const prev = document.querySelector('[data-component="prev"]');
prev.addEventListener('click', onPrev);


if (checkbox.checked) {
  checkbox.checked = false;
}
checkbox.addEventListener('click', () => {
  if (checkbox.checked) {
    pdfContainer.classList.add('active');
    return;
  }
  pdfContainer.classList.remove('active');
});


const sendPos = () => {
  saveLastPos = true;
  const val = input.value;
  httpRequest({ pos: val });
  input.value = '';
};

const pos = document.querySelector('[data-component="pos"]');
pos.addEventListener('click', sendPos);


const refresh = () => {
  httpRequest({ pos: currentIndex });
};

inputPage.addEventListener('keyup', refresh);


const copyToBuffer = () => {
  // const r = document.createRange();
  // r.selectNode(text);
  // document.getSelection().addRange(r);
  // document.execCommand('copy');

  const copy = (e) => {
    e.preventDefault();
    e.clipboardData.setData('text/plain', text.textContent);
  };
  window.addEventListener('copy', copy);
  document.execCommand('copy');
  window.removeEventListener('copy', copy);


  if (index === 2) {
    text.classList.add('sended');
    index = 0;
    if (isSended) {
      return;
    }


    if (saveLastPos) {
      sendedCount += 1;
      sendedElem.textContent = sendedCount;
      changeEmailCount({ inc: -1 });
      const statistics = getLocalStorage();
      const sendedEmail = {
        pos: currentIndex,
        id,
        page: lastCurrentPage,
        email: currentEmailInput.value,
      };
      statistics['Последняя отправка'] = sendedEmail;
      statistics['Последний email'] = currentEmailInput.value;
      statistics['Отправленные'].push(sendedEmail);
      statistics['Всего отправлено'] += 1;
      setLocalStorage(statistics);
    }


    if (checkboxAddComment.checked) {
      addCommentDescribe.classList.remove('red');
      let newComment = comment.replace(/\n/g, '<br>');
      newComment += `<br>${templateMain}`;
      comment = newComment;
      sendComment({ comment: newComment })
        .then(() => {
          addCommentDescribe.classList.add('green');
          setTimeout(() => {
            addCommentDescribe.classList.remove('green');
          }, 1000);
        })
        .catch(() => {
          addCommentDescribe.classList.add('red');
        });
    }

    isSended = true;
  }
  let contentText = jsonText[arr[index]];

  if (index === 0) {
    contentText = sliceEmail({ emailString: contentText });
  }
  const content = contentText;


  // if (index === 2) {
  //   content = content.replace(/\s/g, '.');
  //   console.log(content);
  // }
  text.innerHTML = content;
  index += 1;
  // document.getSelection().removeAllRanges();
};

text.addEventListener('click', copyToBuffer);

let isCountChange = false;
sendedElem.addEventListener('dblclick', () => {
  isCountChange = true;
  arrowCountLeft.classList.remove('hidden');
  arrowCountRight.classList.remove('hidden');
});
arrowCountLeft.addEventListener('click', () => {
  if (!isCountChange) {
    return;
  }
  sendedCount -= 1;
  sendedElem.textContent = sendedCount;
  isCountChange = false;
  arrowCountLeft.classList.add('hidden');
  arrowCountRight.classList.add('hidden');
});
arrowCountRight.addEventListener('click', () => {
  if (!isCountChange) {
    return;
  }
  sendedCount += 1;
  sendedElem.textContent = sendedCount;
  isCountChange = false;
  arrowCountLeft.classList.add('hidden');
  arrowCountRight.classList.add('hidden');
});

















// Приложение авто-комментарий

let autoCommentActive = false;
let commentStartActive = false;
let currentId = null;
let endId = null;
// let hook = 'https://b24-2iruy0.bitrix24.ua/rest/1/nyvcvifbbajtkvh3';
let template = null;
let hook = null;


const autoCommentCheckBoxElem = document.querySelector('.auto-comment__checkbox');
const autoCommentElem = document.querySelector('.auto-comment');
const commentButtonStart = document.querySelector('.auto-comment__start');
const commentButtonStop = document.querySelector('.auto-comment__stop');
const startIdInput = document.querySelector('.auto-comment__from');
const stopIdInput = document.querySelector('.auto-comment__to');
const hookInput = document.querySelector('.auto-comment__hook');
const templateInput = document.querySelector('.auto-comment__template');
const statusElem = document.querySelector('.auto-comment__status');
const autoIdElem = document.querySelector('.auto-comment__id');



const getListId = () => {
  const promise = new Promise((resolve, reject) => {
    statusElem.innerHTML = 'получение листа';
    let start = currentId - 1;
    const result = [];

    const get = () => {
      fetch(`${hook}/crm.company.list?filter[>ID]=${start}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          if (json.result.length === 0) {
            resolve(result);
            return;
          }

          json.result.forEach((item) => {
            if (item.ID <= endId) {
              result.push({
                ID: item.ID,
                COMMENTS: item.COMMENTS,
              });
            }
          });

          if (result.length === 0) {
            resolve(result);
          }

          const end = parseInt(result[result.length - 1].ID);

          if (end < endId) {
            start = end + 1;

            setTimeout(() => {
              get();
            }, 1000);
            return;
          }
          statusElem.innerHTML = '';
          statusElem.classList.remove('red');
          resolve(result);
        })
        .catch((e) => {
          statusElem.innerHTML = 'ошбка получения листа';
          statusElem.classList.add('red');
          reject(e);
        });
    };

    get();
  });

  return promise;
};

const onCommentStop = () => {
  endId = null;
  hook = null;
  template = null;
  hook = null;
  statusElem.innerHTML = '';
  statusElem.classList.remove('red');
  commentStartActive = false;
};

const serialize = (obj, prefix) => {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

const autoSendComment = (batchData) => {
  const promise = new Promise((resolve, reject) => {
    // autoIdElem.innerHTML = `${batchData[0].id} - ${batchData[batchData.length - 1].id}`;
    fetch(`${hook}/batch`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cmd: batchData,
      }),
    })
      .then(response => response.json())
      .then(() => {
        resolve();
      })
      .catch((e) => {
        statusElem.innerHTML = 'Ошибка при добавлении в битрикс';
        statusElem.classList.add('red');
        reject(e);
      });
  });

  return promise;
};


const autoCommentAdd = (list) => {
  const promise = new Promise((resolve, reject) => {
    statusElem.innerHTML = 'Добавление в базу';
    let added = 0;

    if (list.length === 0) {
      resolve();
      return;
    }
    const add = () => {
      const batchData = list.shift();
      autoSendComment(batchData)
        .then(() => {
          added += batchData.length;
          autoIdElem.innerHTML = added;
          // added += 1;
          if (list.length === 0) {
            resolve(added);
            return;
          }
          setTimeout(() => {
            add();
          }, 800);
        })
        .catch((e) => {
          reject(e);
        });
    };

    add();
  });

  return promise;
}

const prepareBatch = (list) => {
  list.forEach((item, i) => {
    const COMMENTS = item.COMMENTS += `<br>${template}`;
    const data = { id: item.ID, fields: { COMMENTS } };
    const request = `crm.company.update?${serialize(data)}`;
    list[i] = request;
  });
  const cmdList = [];

  while (list.length !== 0) {
    cmdList.push(list.splice(0, 50));
  }

  return cmdList;
};


const autoAddComment = () => {
  if (!autoCommentActive || !commentStartActive) {
    statusElem.innerHTML = 'добавление невозможно. модуль в режиме стоп';
    return;
  }

  getListId()
    .then((list) => {
      const cmdList = prepareBatch(list);
      return autoCommentAdd(cmdList);
    })
    .then((added) => {
      statusElem.innerHTML = `Успешно добавленно ${added}`;
      commentStartActive = false;
    })
    .catch((e) => {
      commentStartActive = false;
      console.log(e);
    });
};



autoCommentCheckBoxElem.addEventListener('click', () => {
  if (autoCommentCheckBoxElem.checked) {
    autoCommentActive = true;
    autoCommentElem.classList.remove('hidden');
    return;
  }
  autoCommentActive = false;
  autoCommentElem.classList.add('hidden');
});



commentButtonStart.addEventListener('click', () => {
  statusElem.innerHTML = '';
  statusElem.classList.remove('red');
  if (commentStartActive) {
    return;
  }

  const startId = parseInt(startIdInput.value);
  endId = parseInt(stopIdInput.value);
  hook = hookInput.value;
  template = templateInput.value;

  if (endId % 2 !== 0 || startId % 2 !== 0) {
    onCommentStop();
    statusElem.innerHTML = 'id должны быть четные числа';
    statusElem.classList.add('red');
    return;
  }

  if (!startId || !endId || !hook || !template) {
    onCommentStop();
    statusElem.innerHTML = 'заполните все поля';
    statusElem.classList.add('red');
    return;
  }


  currentId = startId;
  commentStartActive = true;

  autoAddComment();
});


commentButtonStop.addEventListener('click', onCommentStop);


// Добавить комментарий по email

const buttonAddByEmail = document.querySelector('.auto-comment-by-email__add-button');
const inputAddByEmail = document.querySelector('.auto-comment-by-email__email-input');
let lastIdByEmail = null;
let currentIdByEmai = null;

inputAddByEmail.addEventListener('focus', () => {
  inputAddByEmail.value = '';
});

buttonAddByEmail.addEventListener('click', () => {
  if (inputAddByEmail.value === '') {
    statusElem.innerHTML = 'Заполните поле Email';
    statusElem.classList.add('red');
    return;
  }
  statusElem.classList.remove('red');
  statusElem.innerHTML = '';
  if (commentStartActive) {
    return;
  }
  commentStartActive = true;

  const data = {
    order: { DATE_CREATE: 'ASC' },
    filter: { EMAIL: inputAddByEmail.value },
    select: ['id', 'COMMENTS'],
  };

  fetch(`${hookMain}/crm.company.list`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then((dataResult) => {
      if (dataResult.result.length > 1) {
        return Promise.reject(new Error('Найдено больше одного совпадения'));
      }
      if (dataResult.result.length === 0) {
        return Promise.reject(new Error('Email не найден'));
      }

      currentIdByEmai = dataResult.result[0].ID;

      if (currentIdByEmai === lastIdByEmail) {
        return Promise.reject(new Error('Комментарий уже был добавлен'));
      }

      const COMMENTS = dataResult.result[0].COMMENTS += `<br>${commentByEmail}`;
      const dataNew = { id: dataResult.result[0].ID, fields: { COMMENTS } };

      return fetch(`${hookMain}/crm.company.update`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataNew),
      });
    })
    .then(() => {
      statusElem.innerHTML = 'Комментарий успешно добывлен';
      lastIdByEmail = currentIdByEmai;
      commentStartActive = false;

      const statistics = getLocalStorage();
      statistics['Всего не дошло'] += 1;
      setLocalStorage(statistics);
      moveSendedPos({ id: currentIdByEmai, to: 'Не дошедшие' });
    })
    .catch((err) => {
      statusElem.classList.add('red');
      statusElem.innerHTML = err.message;
      commentStartActive = false;
      console.log(err);
    });
});


// Приложение НЕ ОТПРАВЛЕНО

const notSendedButton = document.querySelector('.not-sended-button');
const notSendedContent = document.querySelector('.not-sended-content');


const notSendedClicked = {};
let notSendedPanding = false;


const onNotSendedAddPos = () => {
  if (notSendedClicked[currentIndex]) {
    return;
  }

  sendedCount -= 1;
  changeEmailCount({ inc: 1 });
  sendedElem.textContent = sendedCount;
  notSendedContent.classList.remove('hidden');
  const notSendedHtml = `<span class="not-sended-content__button-pos" data-not-sended-button="${currentIndex}">${currentIndex}</span>`;
  notSendedContent.insertAdjacentHTML('beforeEnd', notSendedHtml);
  notSendedClicked[currentIndex] = true;

  const statistics = getLocalStorage();
  statistics['Подтверждение не отправлено'].push({
    pos: currentIndex,
    id,
    page: lastCurrentPage,
  });
  setLocalStorage(statistics);
};


const onNotSendedClickButton = (event) => {
  if (event.target.classList.contains('not-sended-content__button-pos')) {
    if (notSendedPanding) {
      return;
    }
    saveLastPos = false;
    notSendedPanding = true;
    notSendedRemoveButton.classList.add('hidden');
    notSendedSendButton.classList.add('hidden');
    const NotSendedPos = event.target.textContent;
    httpRequest({ pos: NotSendedPos })
      .then(() => {
        sendNotSendedButton.classList.add('hidden');
        event.target.classList.add('active');
        notSendedRemoveButton.classList.remove('hidden');
        notSendedSendButton.classList.remove('hidden');
        notSendedPanding = false;
      });

    return;
  }

  if (event.target.classList.contains('not-sended-content__remove')) {
    const onNotSendedButtonPos = document.querySelector(`[data-not-sended-button="${currentIndex}"]`);
    if (!onNotSendedButtonPos) {
      return;
    }
    notSendedContent.removeChild(onNotSendedButtonPos);
    event.target.classList.add('hidden');
    notSendedSendButton.classList.add('hidden');
    delete notSendedClicked[currentIndex];

    sendedCount += 1;
    sendedElem.textContent = sendedCount;
    changeEmailCount({ inc: -1 });
    const statistics = getLocalStorage();
    setLocalStorage(statistics);
    removeNotConfirm({ id });

    if (Object.keys(notSendedClicked).length === 0) {
      notSendedContent.classList.add('hidden');
    }

    return;
  }

  if (event.target.classList.contains('not-sended-content__send')) {
    const onNotSendedButtonPos = document.querySelector(`[data-not-sended-button="${currentIndex}"]`);
    if (!onNotSendedButtonPos) {
      return;
    }
    if (notSendedPanding) {
      return;
    }
    notSendedPanding = true;
    let newComment = comment.replace(/\n/g, '<br>');
    if (checkboxAddComment.checked) {
      newComment += `<br>${templateMain}`;
    }
    newComment += '<br>НЕ ОТПРАВЛЕНО';
    sendComment({ comment: newComment })
      .then(() => {
        notSendedPanding = false;
        notSendedContent.removeChild(onNotSendedButtonPos);
        event.target.classList.add('hidden');
        notSendedRemoveButton.classList.add('hidden');
        delete notSendedClicked[currentIndex];
        if (Object.keys(notSendedClicked).length === 0) {
          notSendedContent.classList.add('hidden');
        }

        const statistics = getLocalStorage();
        statistics['Всего не отправлено'] += 1;
        statistics['Всего отправлено'] -= 1;
        setLocalStorage(statistics);
        removeNotConfirm({ id });
        moveSendedPos({ id, to: 'Не отправленные' });
      })
      .catch(() => {
        event.target.classList.add('red');
        setTimeout(() => {
          notSendedPanding = false;
          event.target.classList.remove('red');
        }, 1000);
      });
  }
};

const onSetNotSended = (event) => {
  let newComment = comment.replace(/\n/g, '<br>');
  newComment += '<br>НЕ ОТПРАВЛЕНО';
  sendComment({ comment: newComment })
    .then(() => {
      event.target.classList.add('green');
      sendedCount -= 1;
      changeEmailCount({ inc: 1 });
      sendedElem.textContent = sendedCount;

      // const statistics = getLocalStorage();
      // statistics['Всего не отправлено'] += 1;
      // statistics['Всего отправлено'] -= 1;
      // statistics['Не отправленные'].push({
      //   pos: currentIndex,
      //   id,
      //   page: lastCurrentPage,
      // });
      // setLocalStorage(statistics);

      const statistics = getLocalStorage();
      statistics['Всего не отправлено'] += 1;
      statistics['Всего отправлено'] -= 1;
      setLocalStorage(statistics);
      moveSendedPos({ id, to: 'Не отправленные' });


      setTimeout(() => {
        event.target.classList.remove('green');
      }, 1000);
    })
    .catch(() => {
      event.target.classList.add('red');
      setTimeout(() => {
        event.target.classList.remove('red');
      }, 1000);
    });
};


notSendedButton.addEventListener('click', onNotSendedAddPos);
sendNotSendedButton.addEventListener('click', onSetNotSended);
notSendedContent.addEventListener('click', onNotSendedClickButton);


//  данные из getLocalStorage

const getLastData = () => {
  const statistics = getLocalStorage();
  if (statistics['Последняя отправка'].pos) {
    httpRequest({ pos: statistics['Последняя отправка'].pos });
  }
  if (statistics['Последняя отправка'].page) {
    inputPage.value = statistics['Последняя отправка'].page;
  }
  if (statistics['Всего отправлено']) {
    sendedCount = statistics['Всего отправлено'];
    sendedElem.textContent = statistics['Всего отправлено'];
  }
  if (typeof statistics['Осталось отправить'] === 'number') {
    sendedCountEmail.textContent = statistics['Осталось отправить'];
    emailSendedCount = statistics['Осталось отправить'];
    changeEmailCount({ inc: 0 });
  }
  if (statistics['Последний email']) {
    currentEmailInput.value = statistics['Последний email'];
  }
  if (statistics['Подтверждение не отправлено'].length === 0) {
    return;
  }

  statistics['Подтверждение не отправлено'].forEach((item) => {
    notSendedContent.classList.remove('hidden');
    const notSendedHtml = `<span class="not-sended-content__button-pos" data-not-sended-button="${item.pos}">${item.pos}</span>`;
    notSendedContent.insertAdjacentHTML('beforeEnd', notSendedHtml);
    notSendedClicked[item.pos] = true;
  });
};

getLastData();



// счетчи писем с одного email

sendedCountEmail.addEventListener('click', () => {
  sendedCountEmailInput.classList.remove('hidden');
  sendedCountEmail.classList.add('hidden');
  sendedCountEmailInput.value = sendedCountEmail.textContent;
  sendedCountEmailInput.focus();
});

sendedCountEmailButton.addEventListener('click', () => {
  sendedCountEmail.textContent = sendedCountEmailInput.value;
  sendedCountEmailInput.classList.add('hidden');
  sendedCountEmail.classList.remove('hidden');
  emailSendedCount = parseInt(sendedCountEmail.textContent, 10);

  changeEmailCount({ inc: 0 });
});

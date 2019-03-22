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

const date = new Date();

const getDateFormat = (value) => {
  if (value > 9) {
    return value;
  }
  return `0${value}`;
};

const templateMain = `${getDateFormat(date.getDate())}\/${getDateFormat(date.getMonth() + 1)}\/${date.getFullYear()} Икона алтарь`;
const hookMain = 'https://b24-2iruy0.bitrix24.ua/rest/1/nyvcvifbbajtkvh3';



let id = null;
let comment = null;
let sendedCount = 0;
let isSended = false;
let lastCurrentPage = null;
let lastRequesrData = null;
let isPanding = false;
let jsonText = null;
let index = null;
let jsonLength = null;
let lastIndex = null;
const arr = ['theme', 'email', 'body'];
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
        // console.log(lastCurrentPage, json.currentPage);

        if (json.isPanding || json.index === undefined) {
          isPanding = true;
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
        }

        jsonLength = json.length;
        lastIndex = json.index + 1;
        positionComponent.innerHTML = `${json.index + 1} / ${json.length}`;
        firstNameComponent.innerHTML = json.firstName;
        middleNameComponent.innerHTML = json.middleName;

        jsonText = json.text;
        index = 0;
        const content = jsonText[arr[index]];
        // const content = sliceEmail({ emailString: jsonText[arr[index]] });

        text.innerHTML = content;
        allEmail.innerHTML = jsonText[arr[1]];
        index += 1;
        text.classList.remove('sended');
        lastCurrentPage = json.currentPage;
        sendNotSendedButton.classList.remove('hidden');
        resolve();
      })
      .catch((e) => {
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

  httpRequest({ move: 'next' });
};
const next = document.querySelector('[data-component="next"]');
next.addEventListener('click', onNext);

const onPrev = () => {
  if (isPanding) {
    return;
  }
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
  const r = document.createRange();
  r.selectNode(text);
  document.getSelection().addRange(r);
  document.execCommand('copy');

  if (index === 2) {
    text.classList.add('sended');
    index = 0;
    if (isSended) {
      return;
    }
    sendedCount += 1;
    sendedElem.textContent = sendedCount;

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

  if (index === 1) {
    contentText = sliceEmail({ emailString: contentText });
  }
  const content = contentText;


  // if (index === 2) {
  //   content = content.replace(/\s/g, '.');
  //   console.log(content);
  // }
  text.innerHTML = content;
  index += 1;
  document.getSelection().removeAllRanges();
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
    statusElem.innerHTML = 'получения листа';
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
          resolve(result);
        })
        .catch((e) => {
          statusElem.innerHTML = 'ошбка получения листа';
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
  commentStartActive = false;
};

const autoSendComment = (data) => {
  const promise = new Promise((resolve, reject) => {
    autoIdElem.innerHTML = data.id;
    fetch(`${hook}/crm.company.update`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(() => {
        resolve();
      })
      .catch((e) => {
        statusElem.innerHTML = 'Ошибка при добавлении в битрикс';
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
      const item = list.shift();
      const COMMENTS = item.COMMENTS += `<br>${template}`;
      const data = { id: item.ID, fields: { COMMENTS } };
      autoSendComment(data)
        .then(() => {
          added += 1;
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


const autoAddComment = () => {
  if (!autoCommentActive || !commentStartActive) {
    statusElem.innerHTML = 'добавление невозможно. модуль в режиме стоп';
    return;
  }

  getListId()
    .then((list) => {
      return autoCommentAdd(list);
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
    return;
  }

  if (!startId || !endId || !hook || !template) {
    onCommentStop();
    statusElem.innerHTML = 'заполните все поля';
    return;
  }


  currentId = startId;
  commentStartActive = true;

  autoAddComment();
});


commentButtonStop.addEventListener('click', onCommentStop);


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
  sendedElem.textContent = sendedCount;
  notSendedContent.classList.remove('hidden');
  const notSendedHtml = `<span class="not-sended-content__button-pos" data-not-sended-button="${currentIndex}">${currentIndex}</span>`;
  notSendedContent.insertAdjacentHTML('beforeEnd', notSendedHtml);
  notSendedClicked[currentIndex] = true;
};


const onNotSendedClickButton = (event) => {
  if (event.target.classList.contains('not-sended-content__button-pos')) {
    if (notSendedPanding) {
      return;
    }
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
      sendedElem.textContent = sendedCount;
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

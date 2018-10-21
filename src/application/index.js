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


const date = new Date();
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

const getDateFormat = (value) => {
  if (value > 9) {
    return value;
  }
  return `0 + ${value}`;
};

const sendComment = () => {
  console.log(checkboxAddComment.checked);
  if (!checkboxAddComment.checked) {
    return;
  }
  let newComment = comment.replace(/\n/g, '<br>');
  newComment += `<br>${getDateFormat(date.getDate())}\/${getDateFormat(date.getMonth() + 1)}\/${date.getFullYear()} Юля. Икона Троица.`;
  console.log(newComment);
  const data = {
    id,
    fields:
    {
      COMMENTS: newComment,
    },
  };
  fetch('https://b24-2sa9b2.bitrix24.ru/rest/1/mqst2a2pn25obw29/crm.company.update', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then((json) => {
      console.log(json);
    })
    .catch((e) => {
      console.log(e);
    });
};

const httpRequest = (data) => {
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
      id = json.id;
      comment = json.comment;
      // console.log(lastCurrentPage, json.currentPage);

      if (json.isPanding || json.index === undefined) {
        isPanding = true;
        if (lastRequesrData) {
          setTimeout(() => {
            httpRequest(lastRequesrData);
          }, 200);
        }
        return;
      }
      isPanding = false;

      if (lastCurrentPage !== null && lastCurrentPage !== json.currentPage && json.currentPage !== undefined) {
        lastCurrentPage = json.currentPage;
        lastRequesrData = { pos: 1 };
        httpRequest({ pos: 1 });
        return;
      }
      currentIndex = json.index + 1;
      isSended = false;
      backlightPage(json.currentPage);

      if (json.notSend) {
        topContainer.classList.add('red');
      } else {
        topContainer.classList.remove('red');
      }

      if (lastIndex === jsonLength && currentIndex !== 99) {
        topContainer.classList.add('red');
      }

      jsonLength = json.length;
      lastIndex = json.index + 1;
      positionComponent.innerHTML = `${json.index + 1} / ${json.length}`;
      firstNameComponent.innerHTML = json.firstName;
      middleNameComponent.innerHTML = json.middleName;

      jsonText = json.text;
      index = 0;
      const content = jsonText[arr[index]];

      text.innerHTML = content;
      index += 1;
      text.classList.remove('sended');
      lastCurrentPage = json.currentPage;
    })
    .catch((e) => {
      console.log(e);
    });
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

  if (index === 3) {
    text.classList.add('sended');
    index = 0;
    if (isSended) {
      return;
    }
    sendedCount += 1;
    sendedElem.textContent = sendedCount;
    sendComment();
    isSended = true;
  }
  const content = jsonText[arr[index]];

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

const positionComponent = document.querySelector('[data-component="position"]');
positionComponent.innerHTML = '0 / 0';
const firstNameComponent = document.querySelector('[data-component="first-name"]');
firstNameComponent.innerHTML = 'Имя';
const middleNameComponent = document.querySelector('[data-component="middle-name"]');
middleNameComponent.innerHTML = 'Отчество';
const input = document.querySelector('[data-component="input"]');
const topContainer = document.querySelector('[data-component="top-container"]');
const inputPage = document.querySelector('[data-component="page"]');


let jsonText = null;
let index = null;
const arr = ['email', 'theme', 'body'];
const text = document.querySelector('[data-component="text"]');

const httpRequest = (data) => {
  fetch('http://localhost:8080/application', {
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
      console.log(json);
      if (json.isPanding) {
        return;
      }
      console.log(inputPage)
      if (inputPage.value !== json.currentPage && inputPage.value !== '') {
        topContainer.classList.add('uncurrent-page');
      } else {
        topContainer.classList.remove('uncurrent-page');
      }

      if (json.notSend) {
        topContainer.classList.add('red');
      } else {
        topContainer.classList.remove('red');
      }

      positionComponent.innerHTML = `${json.index + 1} / ${json.length}`;
      firstNameComponent.innerHTML = json.firstName;
      middleNameComponent.innerHTML = json.middleName;

      jsonText = json.text;
      index = 0;
      const content = jsonText[arr[index]];
      text.innerHTML = content;
      index += 1;
      text.classList.remove('sended');
    })
    .catch((e) => {
      console.log(e);
    });
};


const next = document.querySelector('[data-component="next"]');
next.addEventListener('click', httpRequest.bind(null, { move: 'next' }));

const prev = document.querySelector('[data-component="prev"]');
prev.addEventListener('click', httpRequest.bind(null, { move: 'prev' }));

const sendPos = () => {
  const val = input.value;
  httpRequest({ pos: val });
};

const pos = document.querySelector('[data-component="pos"]');
pos.addEventListener('click', sendPos);


const copyToBuffer = () => {
  let r = document.createRange();
  r.selectNode(text);
  document.getSelection().addRange(r);
  document.execCommand('copy');

  if (index === 3) {
    text.classList.add('sended');
    index = 0;
  }
  const content = jsonText[arr[index]];
  text.innerHTML = content;
  index += 1;
};

text.addEventListener('click', copyToBuffer);


window.addEventListener('click', () => {
  console.log('click');
});

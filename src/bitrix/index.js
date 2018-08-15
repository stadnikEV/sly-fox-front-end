class Bitrix {
  constructor() {
    this.currentRawIndex = -1;

    this.timer = this.isLoadDom()
      .then(() => {
        this.numbersOfRaws = this.getNumbersOfRaws();
        if (this.numbersOfRaws === 0) {
          console.warn('Строки с пользователями отсутствуют');
          return;
        }
        const data = {
          empty: true,
        };
        console.log('empty True');
        this.htmlRequest(data);
      });
  }


  isLoadDom() {
    console.log('isLoadDom');
    return new Promise((resolve) => {
      setInterval(() => {
        this.tableElem = document.querySelector('.main-grid-table');
        if (!this.tableElem) {
          return;
        }
        clearInterval(this.timer);
        resolve();
      }, 100);
    });
  }


  getNumbersOfRaws() {
    this.tbodyElem = this.tableElem.querySelector('.main-grid-table tbody');
    return this.tbodyElem.children.length;
  }


  getThPosition({ thName }) {
    try {
      const headElem = this.tableElem.querySelector('thead.main-grid-header');
      const trElem = headElem.firstElementChild;
      for (let i = 0; i < trElem.childNodes.length; i += 1) {
        const thElem = trElem.childNodes[i];
        if (!thElem.hasAttribute('data-name')) {
          continue;
        }
        if (thElem.getAttribute('data-name') !== thName) {
          continue;
        }
        return i;
      }
      return 'undefined';
    } catch (e) {
      console.warn(e);
      return 'undefined';
    }
  }


  getData({ currentRawIndex }) {
    this.currentRawElem = this.tbodyElem.children[currentRawIndex];
    this.currentRawElem.classList.add('main-grid-row-checked');

    function scrollToElement(pos) {
      window.scrollTo({
          top: pos,
          behavior: "smooth"
      });
    };
    function getCoords(elem) {
    var box = elem.getBoundingClientRect();
      return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
      };
    };
    const coord = getCoords(this.currentRawElem);
    scrollToElement(coord.top - this.currentRawElem.clientHeight);

    let email = this.getEmail();
    if (email === null) {
      email = 'undefined';
      console.warn('email не найден');
    }
    let name = this.getName();
    if (name === null) {
      name = 'undefined';
      console.warn('name не найден');
    }
    const notSend = this.isNotSend();
    const currentPage = document.querySelector('.modern-page-current').textContent;
    return {
      name,
      email,
      notSend,
      currentPage,
      index: currentRawIndex,
      length: this.tbodyElem.children.length,
    };
  }

  isNotSend() {
    const positionName = this.getThPosition({ thName: 'COMMENTS' });
    const tdElem = this.currentRawElem.childNodes[positionName];
    const span = tdElem.querySelector('span');
    // по цвету
    const div = span.querySelector('div');
    if (div.firstElementChild) {
      if (div.firstElementChild.tagName === 'FONT') {
        return true;
      }
    }


    const recursion = function a(elem) {
      if (elem.children.length !== 0) {
        return a(elem.children[0]);
      }
      const text = elem.textContent.toLowerCase();
      if (text.search(/не дошло/) !== -1 || text.search(/не отправлено/) !== -1) {
        return true;
      }
      return false;
    };
    const lengthOfChildren = span.children.length;
    for (let i = 0; i < lengthOfChildren; i += 1) {
      if (recursion(span.children[i])) {
        return true;
      }
    }

    return false;
  }


  getEmail() {
    try {
      this.headElem = this.tableElem.querySelector('thead.main-grid-header');
      const positionEmail = this.getThPosition({ thName: 'EMAIL' });
      if (!positionEmail) {
        console.warn('Не найдена позиция Email в header');
        return null;
      }
      const tdElem = this.currentRawElem.childNodes[positionEmail];
      const emailContainerElem = tdElem.querySelector('.crm-client-contacts-block');

      let email = emailContainerElem.querySelector('a').textContent;
      if (typeof email !== 'string') {
        console.warn('основной email не строка');
      }

      if (emailContainerElem.childNodes.length === 1) {
        return email;
      }

      const additionalEmailsElem = emailContainerElem.querySelector('span');
      const dataText = additionalEmailsElem.getAttribute('onClick');

      const titleObj = dataText.match(/title=".*?"/g);
      for (let i = 0; i < titleObj.length; i += 1) {
        const mewEmail = titleObj[i].replace(/title="/, '').replace(/"/, '');
        email = `${email},${mewEmail}`;
        if (typeof email !== 'string') {
          console.warn('дополнительный email не строка');
          return null;
        }
      }
      return email;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }


  getName() {
    try {
      const positionName = this.getThPosition({ thName: 'COMMENTS' });

      if (!positionName) {
        console.warn('Не найдена позиция КОММЕНТАРИЙ в header');
        return null;
      }

      const tdElem = this.currentRawElem.childNodes[positionName];
      const dataText = tdElem.querySelector('div').textContent;
      if (typeof dataText !== 'string') {
        console.warn('не удалось получить строку name');
        return null;
      }
      const nameString = dataText.match(/.*/)[0];
      const name = nameString.split(' ');
      if (name.length !== 3) {
        console.warn('В найденном объекте ФИО не три элемента');
        return null;
      }
      return name;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  htmlRequest(data) {
    fetch('http://localhost:8080/bitrix', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        this.response = response;
        return response.json();
      })
      .then((json) => {
        if (json.move === 'next') {
          if (this.currentRawIndex + 1 < this.tbodyElem.children.length) {
            this.currentRawIndex += 1;
          }
          const dataBitrix = this.getData({ currentRawIndex: this.currentRawIndex });
          console.log(dataBitrix);
          this.htmlRequest(dataBitrix);
        }
        if (json.move === 'prev') {
          if (this.currentRawIndex > 0) {
            this.currentRawIndex -= 1;
          }
          const dataBitrix = this.getData({ currentRawIndex: this.currentRawIndex });
          console.log(dataBitrix);
          this.htmlRequest(dataBitrix);
        }
        if (json.pos) {
          let pos = parseInt(json.pos) - 1;
          this.currentRawIndex = pos;
          console.log(pos);
          if (pos < 0) {
            this.currentRawIndex = 0;
          }
          if (pos > this.tbodyElem.children.length - 1) {
            pos = this.tbodyElem.children.length - 1;
          }
          console.log(this.currentRawIndex);
          const dataBitrix = this.getData({ currentRawIndex: this.currentRawIndex });
          console.log(dataBitrix);
          this.htmlRequest(dataBitrix);
        }
      })
      .catch((e) => {
        setTimeout(() => {
          const newData = {
            empty: true,
          };
          this.htmlRequest(newData);
        }, 400);
        console.warn(e);
        console.warn('Ошибка обработки данных с сервера');
      });
  }
}


new Bitrix();

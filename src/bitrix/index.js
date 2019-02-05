class Bitrix {
  constructor() {
    this.currentRawIndex = -1;

    this.timer = this.isLoadDom()
      .then(() => {
        console.log('load DOM');
        this.numbersOfRaws = this.getNumbersOfRaws();
        if (this.numbersOfRaws === 0) {
          console.warn('Строки с пользователями отсутствуют');
          return;
        }
        const data = {
          empty: true,
        };
        this.httpRequest(data);
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
    if (this.lastCurrentRawElem) {
      this.lastCurrentRawElem.classList.remove('main-grid-row-checked');
    }
    this.currentRawElem = this.tbodyElem.children[currentRawIndex];
    this.lastCurrentRawElem = this.currentRawElem;
    this.currentRawElem.classList.add('main-grid-row-checked');

    function scrollToElement(pos) {
      window.scrollTo({
        top: pos,
        behavior: 'smooth',
      });
    }

    function getCoords(elem) {
      const box = elem.getBoundingClientRect();
      return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset,
      };
    }
    this.headElem = this.tableElem.querySelector('thead.main-grid-header');
    const coord = getCoords(this.currentRawElem);
    scrollToElement(coord.top - this.headElem.clientHeight);

    let notSend = this.isNotSend();

    let email = this.getEmail();
    if (email === null) {
      email = 'undefined';
      console.warn('email не найден');
    }
    let name = this.getName();
    if (name === null) {
      name = ['', '', ''];
      notSend = true;
      console.warn('name не найден');
    }

    const comment = this.getComment();
    const id = this.getId();

    const currentPage = document.querySelector('.modern-page-current').textContent;
    return {
      id,
      comment,
      name,
      email,
      notSend,
      currentPage,
      index: currentRawIndex,
      length: this.tbodyElem.children.length,
    };
  }

  getComment() {
    const positionName = this.getThPosition({ thName: 'COMMENTS' });
    if (!positionName) {
      console.warn('Не найдена позиция КОММЕНТАРИЙ в header');
      return null;
    }
    const tdElem = this.currentRawElem.childNodes[positionName];
    return tdElem.querySelector('span').innerText;
  }

  getId() {
    const positionName = this.getThPosition({ thName: 'ID' });
    const tdElem = this.currentRawElem.childNodes[positionName];
    const idElem = tdElem.querySelector('span');
    return idElem.textContent;
  }

  isNotSend() {
    const positionName = this.getThPosition({ thName: 'COMMENTS' });
    const tdElem = this.currentRawElem.childNodes[positionName];
    const span = tdElem.querySelector('span');

    if (span.querySelector('font')) {
      return true;
    }
    const dataText = span.textContent;
    const matchArr = dataText.match(/(не дошло|НЕ ДОШЛО|не отправлено|НЕ ОТПРАВЛЕНО|нет таких|НЕТ ТАКИХ)/);

    if (!matchArr) {
      return false;
    }
    return true;
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


      const dataText = tdElem.querySelector('span').textContent;
      const matchArr = dataText.match(/[А-Я][а-яёЁ]*\s[А-Я][а-яёЁ]*\s[А-Я][а-яёЁ]*/);

      if (!matchArr) {
        return null;
      }

      const nameString = matchArr[0];
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

  httpRequest(data) {
    fetch('http://localhost:3000/bitrix', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        console.log('ответ с сервера');
        this.response = response;
        return response.json();
      })
      .then((json) => {
        console.log(json);
        if (json.move === 'next') {
          if (this.currentRawIndex + 1 < this.tbodyElem.children.length) {
            this.currentRawIndex += 1;
          }
          const dataBitrix = this.getData({ currentRawIndex: this.currentRawIndex });
          console.log(dataBitrix);
          this.httpRequest(dataBitrix);
        }
        if (json.move === 'prev') {
          if (this.currentRawIndex > 0) {
            this.currentRawIndex -= 1;
          }
          const dataBitrix = this.getData({ currentRawIndex: this.currentRawIndex });
          console.log(dataBitrix);
          this.httpRequest(dataBitrix);
        }
        if (json.pos) {
          const pos = parseInt(json.pos, 10) - 1;
          this.currentRawIndex = pos;
          if (this.currentRawIndex < 0) {
            this.currentRawIndex = 0;
          }
          if (this.currentRawIndex > this.tbodyElem.children.length - 1) {
            this.currentRawIndex = this.tbodyElem.children.length - 1;
          }
          const dataBitrix = this.getData({ currentRawIndex: this.currentRawIndex });
          this.httpRequest(dataBitrix);
        }
      })
      .catch((e) => {
        setTimeout(() => {
          const newData = {
            empty: true,
          };
          this.httpRequest(newData);
        }, 400);
        console.warn(e);
        console.warn('Ошибка обработки данных с сервера');
      });
  }
}

new Bitrix();

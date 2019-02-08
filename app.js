const KEYS = {
  A: 97,
  S: 115,
  D: 100,
  W: 119,
  SPACE: 32,
};

function Bomb(id, x, y, power) {
  this.id = id;
  this.point = {
    x: x,
    y: y
  }
  this.power = power;
  this.set = function () {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.id)
      }, 2000);
    })
  }
}

function Fire(id, x, y) {
  this.id = id
  this.point = {
    x: x,
    y: y
  }
  this.set = function () {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.id)
      }, 1000);
    })
  }
}

let vm = new Vue({
  el: '#app',
  data() {
    return {
      id: 100,
      points: [],
      player: {
        point: {
          x: 0,
          y: 0,
        }
      },
      bombs: [],
      blocks: [],
      fires: [],
    }
  },
  created() {
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 11; j++) {
        this.points.push({
          x: j,
          y: i,
          isBomb: false,
        })

        if (j % 2 == 1 && i % 2 == 1) {
          this.blocks.push({
            x: j,
            y: i
          })
        }
      }
    }

  },
  methods: {
    move(direction) {
      switch (direction) {
        case KEYS.A:
          if (this.player.point.x !== 0 && !this.existsBlock(this.player.point.x - 1, this.player.point.y)) {
            this.player.point.x--;
          }
          break;
        case KEYS.S:
          if (this.player.point.y !== 10 && !this.existsBlock(this.player.point.x, this.player.point.y + 1)) {
            this.player.point.y++;
          }
          break;
        case KEYS.D:
          if (this.player.point.x !== 10 && !this.existsBlock(this.player.point.x + 1, this.player.point.y)) {
            this.player.point.x++;
          }
          break;
        case KEYS.W:
          if (this.player.point.y !== 0 && !this.existsBlock(this.player.point.x, this.player.point.y - 1)) {
            this.player.point.y--;
          }
          break;
        default:
          break;
      }
    },
    setBomb() {
      const idx = this.points.findIndex(point => {
        return point.x === this.player.point.x && point.y === this.player.point.y
      });
      let setPoint = this.points[idx];
      if (setPoint !== undefined && setPoint.isBomb) {
        return;
      }

      let id = 0;
      if (this.bombs.length > 0) {
        id = Math.max.apply(null, this.bombs.map((bomb) => bomb.id)) + 1;
      }
      let createBomb = new Bomb(id, this.player.point.x, this.player.point.y, 2);
      setPoint.isBomb = true;
      this.bombs.push(createBomb);
      createBomb.set().then((result) => {
        this.bombs = this.bombs.filter((bomb) => {
          return bomb.id !== id;
        })
        setPoint.isBomb = false;

        let createFire = null;
        let continueDir = {
          TOP: true,
          RIGHT: true,
          DOWN: true,
          LEFT: true,
        }
        for (let direction = 0; direction < 4; direction++) {
          id = 0;
          createFire = null;
          if (this.fires.length > 0) {
            id = Math.max.apply(null, this.fires.map((fire) => fire.id)) + 1;
          }
          for (let i = 0; i < createBomb.power; i++) {
            switch (direction) {
              case 0:
                if (!this.existsBlock(createBomb.point.x, createBomb.point.y - (i + 1)) && continueDir.TOP) {
                  createFire = new Fire(id, createBomb.point.x, createBomb.point.y - (i + 1));
                  this.fires.push(createFire);
                } else {
                  continueDir.TOP = false;
                }
                break;
              case 1:
                if (!this.existsBlock(createBomb.point.x + (i + 1), createBomb.point.y) && continueDir.RIGHT) {
                  createFire = new Fire(id, createBomb.point.x + (i + 1), createBomb.point.y);
                  this.fires.push(createFire);
                } else {
                  continueDir.RIGHT = false;
                }
                break
              case 2:
                if (!this.existsBlock(createBomb.point.x, createBomb.point.y + i + 1) && continueDir.DOWN) {
                  createFire = new Fire(id, createBomb.point.x, createBomb.point.y + i + 1);
                  this.fires.push(createFire);
                } else {
                  continueDir.DOWN = false;
                }
                break
              case 3:
                if (!this.existsBlock(createBomb.point.x - (i + 1), createBomb.point.y) && continueDir.LEFT) {
                  createFire = new Fire(id, createBomb.point.x - (i + 1), createBomb.point.y);
                  this.fires.push(createFire);
                } else {
                  continueDir.LEFT = false
                }
                break
            }
            id++;
            if (createFire) {
              createFire.set().then((result) => {
                this.fires = this.fires.filter((fire) => {
                  return fire.id !== result;
                })
              });
            }
          }
        }

        createFire = new Fire(id, createBomb.point.x, createBomb.point.y);
        this.fires.push(createFire);
        createFire.set().then((result) => {
          this.fires = this.fires.filter((fire) => {
            return fire.id !== result;
          })
        });
      });
    },
    existsBlock(x, y) {
      let isExists = false;
      this.blocks.forEach(block => {
        if (block.x === x && block.y === y) {
          isExists = true;
        }
      })
      return isExists;
    }
  }
})

window.addEventListener('keypress', function (e) {
  switch (e.keyCode) {
    case KEYS.A:
    case KEYS.S:
    case KEYS.D:
    case KEYS.W:
      vm.move(e.keyCode);
      break
    case KEYS.SPACE:
      e.preventDefault();

      vm.setBomb();
      break
    default:
      break;
  }
})

export default class Benchmark {
  constructor(props) {
    this.setProps(props);
  }

  setProps({
    funcsList,
    funcRepeat
  }) {
    this.funcsList = funcsList;
    this.funcRepeat = funcRepeat ? funcRepeat : 500;
  }

  prepareResults() {
    const results = this.funcsList.reduce((prev, item) => {
      const {func, name} = item;

      prev[name] = {
        name,
        desc: '',
        time: 0,
        times: []
      };

      return prev;
    }, {});

    return results;
  }

  getMedian(times) {
    times.slice().sort((a, b) => a - b);
    let mid = Math.floor(times.length / 2);
    return times[mid];
  }

  handleResults() {
    for(let name in this.results) {
      let item = this.results[name];

      item.median = this.getMedian(item.times);
    }

    return this.results;
  }

  async start(control) {
    this.results = this.prepareResults();

    // Нужно чтобы действия с кнопкой успели отработать
    // до зависания страницы
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.runBenchmarksList());
      }, 100);
    });
  }

  async runBenchmarksList() {
    this.funcsList.forEach(item => {
      this.runBenchmark(item);
    });

    return this.handleResults();
  }

  // Замеряем время выполнения для каждой функции и для всего цикла
  runBenchmark({func, name}) {
    let benchStartTime = performance.now();

    for (let i = 0; i < this.funcRepeat; i++) {
      let funcStartTime = performance.now();
      func();
      const funcDiff = performance.now() - funcStartTime;
      this.results[name].times.push(funcDiff);
    }

    const benchDiff = performance.now() - benchStartTime;
    this.results[name].time += benchDiff;
  }
}

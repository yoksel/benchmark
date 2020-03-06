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
        time: 0
      };

      return prev;
    },{});

    return results;
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

    return this.results;
  }

  runBenchmark({func, name}) {
    let startTime = performance.now();

    for (let i = 0; i < this.funcRepeat; i++) {
      func();
    }

    this.results[name].time += performance.now() - startTime;
  }
}

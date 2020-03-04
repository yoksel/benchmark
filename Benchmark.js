export default class Benchmark {
  constructor({
    funcsList,
    funcRepeat,
    benchRepeat
  }) {
    this.funcsList = funcsList;
    this.funcRepeat = funcRepeat ? funcRepeat : 500;
    this.benchRepeat = benchRepeat ? benchRepeat : 20;
    this.resultTBody = document.querySelector('.results__tbody');
    this.setStatus('Results will be here.<br> During function execition page can be frozen.');
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

  setStatus(message) {
    this.resultTBody.innerHTML =`<tr><td colspan="2" class="results__status">${message}</td></tr>`;
  }

  start(control) {
    this.results = this.prepareResults();

    control.disabled = true;
    control.innerHTML = 'Tests are running...';

    // Нужно чтобы действия с кнопкой успели отработать
    // до зависания страницы
    setTimeout(() => {
      this.runBenchmarksList();
      control.disabled = false;
      control.innerHTML = 'Run';
    }, 500);
  }

  runBenchmarksList() {
    for (let i = 0; i < this.benchRepeat; i++) {
      this.funcsList.forEach(item => {
        this.runBenchmark(item);
      });
    }

    this.printResults();
  }

  runBenchmark({func, name}) {
    let startTime = Date.now();

    for (let i = 0; i < this.funcRepeat; i++) {
      func();
    }

    this.results[name].time += Date.now() - startTime;
  }

  printResults() {
    const resultsList = Object.values(this.results);
    resultsList.sort((a, b) => {
      return a.time - b.time;
    });
    let resultStr = '';

    resultsList.forEach(item => {
      resultStr += `<tr>
        <td><h3>${item.name}</h3>
        ${item.desc}</td>
        <td>${item.time / 1000}s</td>
      </tr>`
    })

    this.resultTBody.innerHTML = '';
    this.resultTBody.insertAdjacentHTML('afterBegin', resultStr);
  }
}

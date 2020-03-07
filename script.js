import Benchmark from './Benchmark.js';

const runBenchmarkControl = document.querySelector('.run-benchmark');
const share = document.querySelector('.share');
const shareInput = document.querySelector('.share__input');
const codeInputs = document.querySelectorAll('.code-containers__textarea');
codeInputs.reduce = [].reduce;
const optionsInputs = document.querySelectorAll('.options__input');
optionsInputs.reduce = [].reduce;
const funcsContainers = getFuncsContainers();
const ls = localStorage;
const lsKey = 'funcsBenchmark';
const resultTBody = document.querySelector('.results__tbody');
const messageProcess = 'Results will be here.<br> During function execition page can be frozen.';
setStatus(messageProcess);

const benchmarkProps = getBenchmarksProps();
const benchmark = initBenchmark();

fillInputs();
setInputsEvents();

// ------------------------------

function initBenchmark() {
  const benchmark = new Benchmark(benchmarkProps);

  runBenchmarkControl.addEventListener('click', runBenchmark);

  return benchmark;
}

// ------------------------------

 async function runBenchmark () {
  runBenchmarkControl.disabled = true;
  runBenchmarkControl.innerHTML = 'Tests are running...';
  setStatus(messageProcess);
  const results = await benchmark.start(runBenchmarkControl);

  runBenchmarkControl.disabled = false;
  runBenchmarkControl.innerHTML = 'Run';
  printResults(results);
}

// ------------------------------

function getFuncsContainers() {
  const codeContainersItems = document.querySelectorAll('.code-containers__item');
  codeContainersItems.reduce = [].reduce;

  const funcsData = codeContainersItems.reduce((prev, item) => {
    const nameElem = item.querySelector('.code-containers__name');
    const codeElem = item.querySelector('.code-containers__textarea');

    prev.push({
      nameElem,
      codeElem
    });

    return prev;
  }, []);

  return funcsData;
}

// ------------------------------

function getFuncsList() {
  const funcsList = funcsContainers.reduce((prev, {nameElem, codeElem}) => {
    if(!codeElem.value.trim()) {
      return prev;
    }

    const func = new Function(codeElem.value);

    prev.push({
      func,
      funcStr: codeElem.value,
      name: nameElem.value
    });

    return prev;
  }, []);

  return funcsList;
}

// ------------------------------

function getOptions() {
  return optionsInputs.reduce((prev, item) => {
    prev[item.name] = item.value;
    return prev;
  }, {})
}

function getBenchmarksProps() {
  const paramsFromUrl = getPropsFromURL();

  if(paramsFromUrl) {
    return paramsFromUrl;
  }

  const paramsFromLs = getPropsFromLS();

  if(paramsFromLs) {
    return paramsFromLs;
  }

  let funcsList = getFuncsList();
  let {funcRepeat} = getOptions();

  return {
    funcsList,
    funcRepeat,
  }
}

// ------------------------------

function updateBench({prop, value}) {
  benchmarkProps[prop] = value;
  benchmark.setProps(benchmarkProps);

  savePropsToLS();
}

// ------------------------------

function getPropsFromURL() {
  const { searchParams } = new URL(location);
  const data = searchParams.get('data')
  if(!data) {
    return;
  }

  return getFuncFromStr(data);
}

// ------------------------------

function savePropsToLS() {
  const propsStr = JSON.stringify(benchmarkProps);
  const urlStr = getUrlStr();

  ls.setItem(lsKey, propsStr);
  shareInput.value = urlStr;
  history.pushState(null, null, urlStr);
}

function getPropsFromLS() {
  const savedParamsStr = ls.getItem(lsKey);

  if(savedParamsStr) {
    return getFuncFromStr(savedParamsStr);
  }

  return;
}

// ------------------------------

function getFuncFromStr(savedParamsStr) {
  const savedParams = JSON.parse(savedParamsStr);

  if(!savedParams.funcsList) {
    return;
  }

  savedParams.funcsList.forEach(item => {
    item.func = new Function(item.funcStr);
  });

  return savedParams;
}

// ------------------------------

function fillInputs() {
  const { funcsList } = benchmarkProps;

  funcsContainers.forEach(({nameElem, codeElem}, index) => {
    if(!funcsList[index]) {
      return;
    }

    nameElem.value = funcsList[index].name;
    codeElem.value = funcsList[index].funcStr;
  });

  optionsInputs.forEach(item => {
    item.value = benchmarkProps[item.name];
  });

  shareInput.value = getUrlStr();
}

// ------------------------------

function getUrlStr() {
  const { origin, pathname } = new URL(location);
  const propsStr = JSON.stringify(benchmarkProps);

  return `${origin + pathname}?data=${encodeURIComponent(propsStr)}`
}

// ------------------------------

function setInputsEvents() {
  funcsContainers.forEach(({nameElem, codeElem}) => {
    nameElem.addEventListener('input', () => {
      updateBench({
        prop: 'funcsList',
        value: getFuncsList()
      });
    });
    codeElem.addEventListener('input', () => {
      updateBench({
        prop: 'funcsList',
        value: getFuncsList()
      });
    });
  });

  optionsInputs.forEach(item => {
    item.addEventListener('input', elem => {
      updateBench({
        prop: item.name,
        value: item.value
      });
    });
  });

  share.addEventListener('click', (event) => {
    if(!event.target.classList.contains('share__text')) {
      return;
    }
    share.classList.toggle('share--opened');

    event.stopPropagation();
  });

  document.addEventListener('click', (event) => {
    if(event.target.classList.contains('share__input')) {
      return;
    }

    share.classList.remove('share--opened');
  });
}

function setStatus(message) {
  resultTBody.innerHTML =`<tr><td colspan="3" class="results__status">${message}</td></tr>`;
}

function printResults(results) {
  const resultsList = Object.values(results);
  resultsList.sort((a, b) => {
    return a.time - b.time;
  });
  let resultStr = '';

  resultsList.forEach(item => {
    let seconds = toSeconds(item.time);
    let median = item.median.toFixed(2);

    resultStr += `<tr>
      <td><h3>${item.name}</h3>
      ${item.desc}</td>
      <td>${seconds}s</td>
      <td>${median}ms</td>
    </tr>`
  })

  resultTBody.innerHTML = '';
  resultTBody.insertAdjacentHTML('afterBegin', resultStr);
}

function toSeconds(ms) {
  return (ms / 1000).toFixed(2);
}

import Benchmark from './Benchmark.js';

const runBenchmarkControl = document.querySelector('.run-benchmark');

const codeInputs = document.querySelectorAll('.code-containers__textarea');
codeInputs.reduce = [].reduce;
const optionsInputs = document.querySelectorAll('.options__input');
optionsInputs.reduce = [].reduce;
const funcsContainers = getFuncsContainers();
const ls = localStorage;
const lsKey = 'funcsBenchmark';

setInputsEvents();

const benchmarkProps = getBenchmarksProps();
const benchmark = initBenchmark();

// ------------------------------

function initBenchmark() {
  console.log('benchmarkProps', benchmarkProps);
  const benchmark = new Benchmark(benchmarkProps);

  runBenchmarkControl.addEventListener('click', () => {
    benchmark.start(runBenchmarkControl);
  });

  return benchmark;
}

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

function getOptions() {
  return optionsInputs.reduce((prev, item) => {
    prev[item.name] = item.value;
    return prev;
  }, {})
}

function getBenchmarksProps() {
  const paramsFromLs = getPropsFromLS();
  console.log(paramsFromLs);
  if(paramsFromLs) {
    return paramsFromLs;
  }

  let funcsList = getFuncsList();
  let {funcRepeat, benchRepeat} = getOptions();

  return {
    funcsList,
    funcRepeat,
    benchRepeat
  }
}

function updateBench({prop, value}) {
  benchmarkProps[prop] = value;

  savePropsToLS();
}

function savePropsToLS() {
  console.log('benchmarkProps', benchmarkProps);
  console.log('JSON.stringify(benchmarkProps)', JSON.stringify(benchmarkProps));
  ls.setItem(lsKey, JSON.stringify(benchmarkProps))
}

function getPropsFromLS() {
  const savedParams = ls.getItem(lsKey);

  if(savedParams) {
    return JSON.parse(savedParams);
  }

  return;
}

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
}

import * as echarts from '../../components/ec-canvas/echarts';
import EventHub from '../../EventHub';

let chart = null;

function initChart(canvas, width, height, dpr, callback) {
  chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr, // new
  });
  canvas.setChart(chart);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
      },
      confine: true,
    },
    legend: {
      data: ['热度', '正面', '负面'],
    },
    grid: {
      left: 20,
      right: 20,
      bottom: 15,
      top: 40,
      containLabel: true,
    },
    xAxis: [
      {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#999999',
          },
        },
        axisLabel: {
          color: '#666666',
        },
      },
    ],
    yAxis: [
      {
        type: 'category',
        axisTick: { show: false },
        data: ['汽车之家', '今日头条', '百度贴吧', '一点资讯', '微信', '微博', '知乎'],
        axisLine: {
          lineStyle: {
            color: '#999999',
          },
        },
        axisLabel: {
          color: '#666666',
        },
      },
    ],
    series: [
      {
        name: '热度',
        type: 'bar',
        label: {
          normal: {
            show: true,
            position: 'inside',
          },
        },
        data: [300, 270, 340, 344, 300, 320, 310],
        itemStyle: {
          // emphasis: {
          //   color: '#37a2da'
          // }
        },
      },
      {
        name: '正面',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
          },
        },
        data: [120, 102, 141, 174, 190, 250, 220],
        itemStyle: {
          // emphasis: {
          //   color: '#32c5e9'
          // }
        },
      },
      {
        name: '负面',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
            position: 'left',
          },
        },
        data: [-20, -32, -21, -34, -90, -130, -110],
        itemStyle: {
          // emphasis: {
          //   color: '#67e0e3'
          // }
        },
      },
    ],
  };

  chart.setOption(option);

  callback(chart);
}

EventHub.on('ec-init', initChart);

Page({
  data: {
    ec: {

    },
  },

  onLoad(option) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('acceptDataFromOpenedPage', { data: 'test' });
    eventChannel.emit('someEvent', { data: 'test' });
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      console.log('acceptDataFromOpenerPage', data);
    });
  },
});
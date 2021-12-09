window.bootstrap = require('bootstrap/dist/js/bootstrap.bundle.js');
import "./style/all.scss";

const api_path = "lumei";
const baseUrl = "https://livejs-api.hexschool.io";
const config = {
  headers: {
    Authorization: "tqzmDBpaXzXeRWNYwrtAdzGeSaT2"
  }
};
let orderData = [];
const loader = document.querySelector(".loader");
const orderList = document.querySelector(".js-orderList");
const deleteAllBtn = document.querySelector(".js-deleteAllBtn");
const allChart = document.querySelector(".js-allChart");
init();

//初始化
function init() {
  getOrderData();
  deleteAllBtn.addEventListener("click", deleteAllOrder);
  orderList.addEventListener("click", e => {
    e.preventDefault();
    if (e.target.nodeName === 'BUTTON') {
      console.log(e.target.dataset.orderId);
      deleteOrderData(e.target.dataset.orderId);
    } else if (e.target.nodeName === 'A') {
      const orderId = e.target.dataset.orderId;
      const index = orderData.findIndex((item) => item.id === orderId);
      const isPaid = !orderData[index].paid;
      editOrderStatus(orderId, isPaid);
    }
  })
}
//渲染訂單
function renderOrderList() {
  let str = "";
  if (orderData.length === 0) {
    str = `<tr><td colspan="8" class="fs-3">目前無訂單</td></tr>`
    deleteAllBtn.classList.add("disabled");
  } else {
    deleteAllBtn.classList.remove("disabled");
    orderData.forEach(item => {
      let date = new Date(item.createdAt * 1000).toLocaleDateString();
      let productStr = "";
      item.products.forEach((productItem) => {
        productStr += `<li>${productItem.title}
        <span>${productItem.quantity}個</span>
        </li>`
      });
      str += `<tr>
      <td>${item.createdAt}</td>
      <td>${item.user.name}<br>${item.user.tel}</td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td><ul class="mb-0">${productStr}</ul></td>
      <td>${date}</td>
      <td>
        <a href="#" class="text-blue" data-order-id="${item.id}">${item.paid ? "已處理" : "未處理"}</a>
      </td>
      <td>
        <button type="button" class="btn btn-danger" data-order-id="${item.id}">刪除</button>
      </td>
    </tr>
    `
    })
  }
  orderList.innerHTML = str;

}
//渲染圖表：類別營收
function renderCategoryChart() {
  if (orderData.length === 0) {
    allChart.style.display = "none";
  } else {
    if (allChart.style.display = "none")
      allChart.style.display = "flex";
    let obj = {};
    orderData.forEach((item) => {
      item.products.forEach(productsItem => {
        if (!obj[productsItem.category]) {
          obj[productsItem.category] = 1 * productsItem.quantity;
        } else {
          obj[productsItem.category] += 1 * productsItem.quantity;
        }
      })
    });
    let data = Object.entries(obj);
    const chart = c3.generate({
      bindto: "#categoryChart",
      data: {
        columns: data,
        type: "pie",
      },
      color: {
        pattern: ['#DACBFF', '#9D7FEA', '#5434A7']
      }
    });
  }
}
//渲染圖表：品項營收
function renderProductChart() {
  let obj = {};
  orderData.forEach((item) => {
    item.products.forEach(productsItem => {
      if (!obj[productsItem.title]) {
        obj[productsItem.title] = 1 * productsItem.quantity;
      } else {
        obj[productsItem.title] += 1 * productsItem.quantity;
      }
    })
  });
  let cachedata = Object.entries(obj);
  cachedata = cachedata.sort(function (a, b) {
    return b[1] - a[1];
  });
  let data;
  if (cachedata.length > 3) {
    data = cachedata.splice(0, 3);
    let num = 0;
    cachedata.forEach((item) => {
      num += item[1];
    })
    data.push(["其他", num]);
  } else {
    data = cachedata;
  }
  const chart = c3.generate({
    bindto: "#productChart",
    data: {
      columns: data,
      type: "pie",
    },
    color: {
      pattern: ['#DACBFF', '#9D7FEA', '#5434A7', "#000"]
    }
  });
}
//loader開關
function toggleLoader(show) {
  if (show)
    loader.style.display = "flex";
  else
    loader.style.display = "none";
}
//api:取得訂單列表
function getOrderData() {
  const url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`;
  axios
    .get(url, config)
    .then((res) => {
      if (res.data.status) {
        orderData = res.data.orders;
        console.log("取得訂單列表");
        renderOrderList();
        renderCategoryChart();
        renderProductChart();
      }
    })
    .catch((err) => {
      if (!err.response.data.status) {
        console.error(err.response.data.message);
      }
    })
    .then(() => {
      toggleLoader(false);
    });
}
//api:刪除特定訂單
function deleteOrderData(orderId) {
  toggleLoader(true);
  const url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${orderId}`;
  axios
    .delete(url, config)
    .then((res) => {
      if (res.data.status) {
        orderData = res.data.orders;
        renderOrderList();
        renderCategoryChart();
        renderProductChart();
        console.log("刪除特定訂單");
      }
    })
    .catch((err) => {
      if (!err.response.data.status) {
        console.error(err.response.data.message);
      }
    })
    .then(() => {
      toggleLoader(false);
    });
}
//api:刪除全部訂單
function deleteAllOrder() {
  toggleLoader(true);
  const url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`;
  axios
    .delete(url, config)
    .then((res) => {
      if (res.data.status) {
        orderData = res.data.orders;
        renderOrderList();
        renderCategoryChart();
        renderProductChart();
        console.log("刪除全部訂單");
      }
    })
    .catch((err) => {
      if (!err.response.data.status) {
        console.error(err.response.data.message);
      }
    })
    .then(() => {
      toggleLoader(false);
    });
}
//api:修改訂單狀態
function editOrderStatus(orderId, isPaid) {
  toggleLoader(true);
  const url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`;
  const data = {
    data: {
      id: orderId,
      paid: isPaid,
    }
  };
  axios
    .put(url, data, config)
    .then((res) => {
      if (res.data.status) {
        orderData = res.data.orders;
        renderOrderList();
        renderCategoryChart();
        renderProductChart();
        console.log("修改訂單狀態");
      }
    })
    .catch((err) => {
      if (!err.response.data.status) {
        console.error(err.response.data.message);
      }
    })
    .then(() => {
      toggleLoader(false);
    });
}
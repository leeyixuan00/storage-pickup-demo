const products = [
  {
    image: "./assets/diaper-m.png",
    name: "好奇皇家铂金纸尿裤",
    spec: "M 码 · 64 片",
    stored: 8,
    available: 5,
    picked: 3
  },
  {
    image: "./assets/pants-l.png",
    name: "好奇成长裤拉拉裤",
    spec: "L 码 · 52 片",
    stored: 6,
    available: 4,
    picked: 2
  },
  {
    image: "./assets/wipes.png",
    name: "好奇婴儿湿巾",
    spec: "80 抽 × 3 包",
    stored: 4,
    available: 3,
    picked: 1
  }
];

const packages = [
  {
    title: "包裹 1 · 北京仓",
    sub: "好奇皇家铂金纸尿裤 M 码 × 2，湿巾 × 1",
    tag: "已签收",
    tone: "green",
    expanded: true,
    timeline: [
      ["已签收", "05-26 10:18 妈妈驿站代收点已签收", "done"],
      ["派送中", "05-26 08:02 快递员正在为您派送", "done"],
      ["已发货", "05-25 19:40 北京仓已完成出库", "done"]
    ]
  },
  {
    title: "包裹 2 · 广州仓",
    sub: "好奇成长裤拉拉裤 L 码 × 3",
    tag: "运输中",
    tone: "blue",
    expanded: true,
    timeline: [
      ["运输中", "05-26 16:30 已到达华东转运中心，预计明日送达", "current"],
      ["已发货", "05-25 21:12 广州仓已完成出库", "done"],
      ["待揽收", "05-25 18:46 仓库已生成面单", ""]
    ]
  }
];

const details = {
  "规则说明": "寄存商品会按当前可提库存、仓库位置和履约时效自动分仓。若同一次提货被拆成多个包裹，物流会分别更新，全部包裹送达后订单才算完整完成。",
  "寄存明细": "本页展示您当前仍在平台寄存的商品。可提货数量代表本次可直接申请发出的库存，已提货数量代表历史已完成提货的商品数量。",
  "为什么会拆单？": "同一笔提货中，不同品类或尺码可能分布在不同仓库。系统会优先选择有库存且距离更近的仓库发货，所以可能拆成多个包裹。",
  "为什么物流不同？": "每个仓库对应的承运商、揽收时间和转运线路可能不同，因此物流单号和到达时间会存在差异。",
  "为什么只收到部分商品？": "通常是其中一个包裹先到，剩余包裹仍在运输中。请在物流页查看每个包裹状态，系统会标出未送达包裹，避免误判为漏发。",
  "订单问题反馈": "请选择问题类型并补充照片或说明，系统会先自动核对包裹状态、出库数量和签收记录，再为您转入对应处理流程。",
  "在线客服": "已为您整理当前订单的拆单、物流和未送达包裹信息。转人工后客服可以直接看到这些上下文，减少重复沟通。"
};

let currentPage = "home";
let pickupCount = 3;
const available = 8;
const historyStack = ["home"];

const pageTitle = document.querySelector("#pageTitle");
const productList = document.querySelector("#productList");
const packageList = document.querySelector("#packageList");
const modalBackdrop = document.querySelector("#modalBackdrop");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");

function renderProducts() {
  productList.innerHTML = products.map((item) => `
    <article class="product-card">
      <img src="${item.image}" alt="${item.name}" />
      <div class="product-info">
        <h3>${item.name}</h3>
        <p class="product-meta">${item.spec}</p>
        <div class="product-counts">
          <div><span>已寄存</span><strong>${item.stored}</strong></div>
          <div><span>可提货</span><strong>${item.available}</strong></div>
          <div><span>已提货</span><strong>${item.picked}</strong></div>
        </div>
        <button class="mini-btn" data-nav="pickup">立即提货</button>
      </div>
    </article>
  `).join("");
}

function renderPackages() {
  packageList.innerHTML = packages.map((item) => `
    <article class="package-card ${item.expanded ? "expanded" : ""}">
      <button class="package-head" aria-expanded="${item.expanded}">
        <span>
          <strong>${item.title}</strong>
          <span class="package-sub">${item.sub}</span>
        </span>
        <i class="status-tag ${item.tone}">${item.tag}</i>
      </button>
      <div class="timeline">
        ${item.timeline.map((event) => `
          <div class="timeline-item ${event[2]}">
            <strong>${event[0]}</strong>
            <p>${event[1]}</p>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function navigate(page, push = true) {
  currentPage = page;
  document.querySelectorAll(".page").forEach((node) => node.classList.remove("active"));
  const target = document.querySelector(`#${page}Page`);
  target.classList.add("active");
  pageTitle.textContent = target.dataset.title;

  document.querySelectorAll("[data-nav]").forEach((node) => {
    node.classList.toggle("active", node.dataset.nav === page);
  });

  if (push && historyStack[historyStack.length - 1] !== page) {
    historyStack.push(page);
  }

  document.querySelector(".phone-frame").scrollTo({ top: 0, behavior: "smooth" });
}

function updateQuantity() {
  pickupCount = Math.max(1, Math.min(available, pickupCount));
  document.querySelector("#pickupCount").textContent = pickupCount;
  document.querySelector("#takeCount").textContent = pickupCount;
  document.querySelector("#remainCount").textContent = available - pickupCount;
  document.querySelector("#availableCount").textContent = available;
}

function openModal(title) {
  modalTitle.textContent = title;
  modalText.textContent = details[title] || "当前为原型弹窗，用于承载订单、物流或客服详情信息。";
  modalBackdrop.hidden = false;
}

document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-nav]");
  if (navButton) {
    navigate(navButton.dataset.nav);
    return;
  }

  const detailButton = event.target.closest("[data-open-detail]");
  if (detailButton) {
    openModal(detailButton.dataset.openDetail);
    return;
  }

  const choice = event.target.closest(".segmented button, .size-grid button");
  if (choice) {
    choice.parentElement.querySelectorAll("button").forEach((button) => button.classList.remove("active"));
    choice.classList.add("active");
    return;
  }

  const collapsible = event.target.closest(".collapse-head, .package-head");
  if (collapsible) {
    const card = collapsible.closest(".warehouse-card, .package-card");
    card.classList.toggle("expanded");
    collapsible.setAttribute("aria-expanded", card.classList.contains("expanded"));
  }
});

document.querySelector("#minusBtn").addEventListener("click", () => {
  pickupCount -= 1;
  updateQuantity();
});

document.querySelector("#plusBtn").addEventListener("click", () => {
  pickupCount += 1;
  updateQuantity();
});

document.querySelector("#backBtn").addEventListener("click", () => {
  if (historyStack.length > 1) {
    historyStack.pop();
    navigate(historyStack[historyStack.length - 1], false);
  } else {
    navigate("home", false);
  }
});

document.querySelector("#modalClose").addEventListener("click", () => {
  modalBackdrop.hidden = true;
});

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    modalBackdrop.hidden = true;
  }
});

renderProducts();
renderPackages();
updateQuantity();

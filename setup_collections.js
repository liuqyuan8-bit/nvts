// 文件名: setup_collections.js
// 运行环境: Node.js (非浏览器)

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // 确保文件路径正确

// 根据您的 .firebaserc 或 firebase.js 文件配置项目 ID
const projectId = "nvts188"; 

// 初始化 Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const defaultPassword = '123456'; // ⚠️ 仅用于演示，生产环境请使用更安全的密码

// 辅助函数：格式化日期为 YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

const setupCollections = async () => {
  console.log("--- 正在初始化 Firebase 核心数据 (请确保已完成 Auth SDK 准备) ---");

  // 1. users 集合 (用户角色 & Auth 创建)
  const userRoleData = [
    { id: 'admin_uid_example', email: 'admin@nvts.com', role: 'admin', name: '系统管理员' },
    { id: 'dispatcher_uid_example', email: 'dispatcher@nvts.com', role: 'dispatcher', name: '任务调度员' },
    { id: 'driver_uid_example', email: 'driver@nvts.com', role: 'driver', name: '一号司机' },
  ];

  for (const userData of userRoleData) {
    // 尝试创建 Auth 用户，如果已存在则跳过创建，只更新 Firestore 文档
    try {
      await admin.auth().createUser({
        uid: userData.id,
        email: userData.email,
        password: defaultPassword,
        displayName: userData.name,
        emailVerified: true,
      });
      console.log(`- 成功创建 Auth 用户: ${userData.email}`);
    } catch (error) {
      if (error.code !== 'auth/uid-already-exists' && error.code !== 'auth/email-already-exists') {
        console.error(`- 创建 Auth 用户 ${userData.email} 失败:`, error.message);
        continue;
      }
    }
    
    // 设置 Firestore 角色文档
    await db.collection('users').doc(userData.id).set({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true }); // 使用 merge: true 防止覆盖其他字段
  }
  console.log(`✅ 集合 'users' (用户角色) 初始化完成。
    示例账号: admin@nvts.com, dispatcher@nvts.com, driver@nvts.com 
    默认密码: ${defaultPassword}
  `);
  
  // 2. vehicles 集合 (卡车档案)
  const vehicleRef = db.collection('vehicles').doc('truck001');
  await vehicleRef.set({
    plate: "AA-123-BB",
    trailerPlate: "T-456-CC",
    vin: "VIN1234567890ABCDE",
    insuranceExpiry: formatDate(new Date(2026, 5, 1)), // 2026-06-01
    annualInspection: formatDate(new Date(2027, 0, 15)), // 2027-01-15
    ownerDriverId: 'driver_uid_example', // 默认车主
    currentDriverId: 'driver_uid_example', // 默认司机
    docs: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("✅ 集合 'vehicles' (卡车档案) 创建并插入了示例数据 (AA-123-BB)。");

  // 3. partners 集合 (合作方/收货方/供货方)
  await db.collection('partners').doc('partnerA').set({
    name: "CPA 供应商基地",
    contact: "老王",
    phone: "+86 138-0000-0000",
    address: "卡萨布兰卡 工业园区 A 座",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('partners').doc('partnerB').set({
    name: "项目工地 X",
    contact: "小李",
    phone: "+86 139-1111-1111",
    address: "首都 XX 建筑工地",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("✅ 集合 'partners' (合作方) 创建并插入了示例数据 (CPA 供应商基地, 项目工地 X)。");
  
  // 4. tasks 集合 (任务)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await db.collection('tasks').add({
    driverId: 'driver_uid_example', // 派发给示例司机
    driverName: '一号司机',
    vehiclePlate: 'AA-123-BB',
    status: 'pending', // 待接单
    plannedDate: formatDate(tomorrow),
    cargoType: 'CPA-CEM I 42.5', // 货物类型
    weight: '30', // 重量/数量
    supplier: 'CPA 供应商基地',
    receiver: '项目工地 X',
    remarks: '请注意绕行市区，走高速。',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("✅ 集合 'tasks' (任务) 创建并插入了 1 条待接单示例任务。");
  
  console.log("\n--- 所有核心集合创建和初始化完成！请检查您的 Firestore 和 Authentication 控制台。---");
};

setupCollections().catch(console.error).finally(() => process.exit(0));
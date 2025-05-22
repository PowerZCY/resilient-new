-- 0. 删除 _prisma_migrations 表
DROP TABLE IF EXISTS "_prisma_migrations";

-- 1. 添加新自增字段
ALTER TABLE detail ADD COLUMN id_new BIGSERIAL;

-- 2. 让旧数据 id_new 从 1000001 开始递增
WITH numbered AS (
  SELECT id_new, ROW_NUMBER() OVER (ORDER BY id_new) AS rn
  FROM detail
)
UPDATE detail
SET id_new = numbered.rn + 1000000
FROM numbered
WHERE detail.id_new = numbered.id_new;

-- 3. 删除原主键约束
ALTER TABLE detail DROP CONSTRAINT detail_pkey;

-- 4. 删除原 id 字段
ALTER TABLE detail DROP COLUMN id;

-- 5. 重命名 id_new 为 id
ALTER TABLE detail RENAME COLUMN id_new TO id;

-- 6. 重命名序列
ALTER SEQUENCE detail_id_new_seq RENAME TO detail_id_seq;

-- 7. 绑定新序列为 id 字段默认值
ALTER TABLE detail ALTER COLUMN id SET DEFAULT nextval('detail_id_seq');

-- 8. 设置序列起始值为最大 id + 1
SELECT MAX(id) FROM detail;
-- 假设最大 id 是 1000010
ALTER SEQUENCE detail_id_seq RESTART WITH 1000518;

-- 9. 设 id 为主键
ALTER TABLE detail ADD PRIMARY KEY (id);
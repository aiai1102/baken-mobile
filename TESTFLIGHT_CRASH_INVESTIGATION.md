# TestFlightクラッシュ問題 - 調査レポート

> **TL;DR（要約）**: Expo SDK 54でTestFlightが起動時クラッシュする問題は、**New Architecture ONに戻す + Reanimated 4.1.1に更新 + 矛盾する設定を削除**で解決しました。誤った前提（nativewind 4がreanimated 4未サポート）が原因で板挟みだと判断していましたが、実際にはNativeWind v4.2.0+はReanimated v4対応済みでした。

## ✅ 解決済み（2026-01-25）

**結論**: TestFlightでの起動クラッシュは**New Architecture ON + Reanimated 4.1.1**で解決しました。

### 成功した構成

```json
// app.json
{
  "newArchEnabled": true  // ONに戻す
}

// eas.json
{
  "production": {
    "autoIncrement": true
    // RCT_NEW_ARCH_ENABLEDは削除（矛盾を排除）
  }
}

// package.json
{
  "react-native-reanimated": "~4.1.1",  // SDK 54推奨
  "nativewind": "^4.2.1"  // デザイン維持
}
```

### 解決の手順

1. **誤った前提の修正**
   - ❌ 誤り: "nativewind 4はreanimated 4未サポート"
   - ✅ 正解: **NativeWind v4.2.0+はReanimated v4対応済み**

2. **設定の一本化**
   ```bash
   # app.jsonでNew Arch ONに戻す
   "newArchEnabled": true

   # eas.jsonの矛盾する設定を削除
   # RCT_NEW_ARCH_ENABLED: "0" を削除

   # package.jsonのexclude設定を削除
   # "expo.install.exclude" から "react-native-reanimated" を削除
   ```

3. **依存関係の修正**
   ```bash
   npx expo install react-native-reanimated  # 4.1.1に更新
   npx expo-doctor  # 問題なし確認
   ```

4. **ビルド＆テスト**
   ```bash
   eas build --platform ios --profile production --clear-cache
   eas submit --platform ios --latest
   # TestFlightで起動成功！
   ```

### 重要な学び

**板挟み状態は存在しなかった**:
- 初期の調査で「New Arch ONでクラッシュ、OFFでビルド失敗」という板挟みだと判断
- しかし実際には、NativeWind v4.2.1が既にReanimated v4対応済みだった
- 正しい構成（New Arch ON + Reanimated 4）で問題なく動作した

**矛盾する設定が原因**:
- `app.json`の`newArchEnabled`と`eas.json`の`RCT_NEW_ARCH_ENABLED`が矛盾
- `package.json`の`expo.install.exclude`がReanimatedの自動更新を阻害
- これらの矛盾を解消することで解決

---

## 問題の概要（初期状態）

**症状**: Expo SDK 54で開発したiOSアプリがTestFlightで起動直後にクラッシュする

**環境情報**:
- Expo SDK: 54.0.32
- React Native: 0.81.5
- ビルド環境: EAS Build
- テストデバイス: iPhone 15 Pro, iOS 18.7.1
- 現在のbuildNumber: 16

**状況**:
- ローカルの`expo start`とExpo Goでは正常動作
- TestFlightビルド（production）では起動直後にクラッシュ
- `feedback.json`に`appUptimeMillis: null`と記録（アプリが1ミリ秒も動作していない）

---

## 初期クラッシュログ

```
Exception Type: EXC_CRASH (ObjC Exception)
Exception Codes: 0x0000000000000000, 0x0000000000000000
Exception Note: SIMULATED (this is NOT a crash)

Crashed Thread: 0

Application Specific Information:
*** Terminating app due to uncaught exception 'NSInvalidArgumentException'
stack backtrace:
...
ObjCTurboModule::performVoidMethodInvocation
```

**重要**: `ObjCTurboModule`は**React Native New Architecture**（TurboModules）のコンポーネントです。

---

## 根本原因の特定

`app.json`の設定を確認:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true  // ← これが原因
          }
        }
      ]
    ]
  }
}
```

**問題点**:
- New Architecture (`newArchEnabled: true`) が有効化されていた
- Expo SDK 54のNew Architectureはまだ実験的段階
- Expo Goは部分的なNew Architectureサポート（動作する）
- TestFlightのproductionビルドはフルのNew Architecture（クラッシュ）

---

## 試した解決策と結果

### 試行1: New Architectureを無効化

**変更内容**:
```json
// app.json
{
  "newArchEnabled": false,
  "scheme": "baken"
}
```

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "RCT_NEW_ARCH_ENABLED": "0"
      }
    }
  }
}
```

**結果**: ❌ 別のエラーが発生

---

### 試行2: react-native-reanimated 4.1.1 + react-native-worklets

**理由**:
- Expo SDK 54のデフォルトはreanimated 4.x
- reanimated 4にはreact-native-workletsが必要

**実行**:
```bash
npm install react-native-worklets@0.5.1 react-native-reanimated@4.1.1
```

**結果**: ❌ ビルドエラー

```
[!] Invalid `RNReanimated.podspec` file:
[Reanimated] Reanimated requires the New Architecture to be enabled.
If you have `RCT_NEW_ARCH_ENABLED=0` set in your environment you should remove it.
```

**問題**: reanimated 4.xは**New Architecture必須**だが、New Archを有効にするとTestFlightでクラッシュする（矛盾）

---

### 試行3: react-native-reanimated 3.16.1へダウングレード

**理由**:
- Expo公式ドキュメント: "Legacy ArchitectureならReanimated 3を使用可能"
- nativewind 4.2.1はreanimated 4未サポート（デザイン維持のため3が必須）

**実行**:
```bash
npm uninstall react-native-worklets react-native-reanimated
npx expo install react-native-reanimated@~3.16.1
```

**結果**: ❌ ビルドエラー（Folly）

```
❌ 'folly/coro/Coroutine.h' file not found

Error building the application:
CompileC ReanimatedRuntime.cpp
  ios/Pods/Headers/Public/RCT-Folly/folly/Expected.h:1587:10
  #include <folly/coro/Coroutine.h>
           ^ 'folly/coro/Coroutine.h' file not found
```

**調査結果**:
- これはReact Native 0.81 + Follyの既知の問題
- GitHub Issue: https://github.com/facebook/react-native/issues/53575
- Follyライブラリが`folly/coro/Coroutine.h`を参照しているが、このファイルが存在しない

---

## ❌ ジレンマ（板挟み状態）- 誤った前提に基づく分析

**注意**: このセクションは**誤った前提**（nativewind 4がreanimated 4未サポート）に基づいた分析です。実際にはNativeWind v4.2.0+はReanimated v4対応済みで、板挟み状態は存在しませんでした。

### パターンA: New Architecture有効化
```
newArchEnabled: true
RCT_NEW_ARCH_ENABLED: 1
react-native-reanimated: 4.1.1
```
**結果**: ✅ ビルド成功 → ❌ TestFlightでクラッシュ

### パターンB: New Architecture無効化
```
newArchEnabled: false
RCT_NEW_ARCH_ENABLED: 0
react-native-reanimated: 3.16.1
```
**結果**: ❌ ビルド失敗（folly/coro/Coroutine.h not found）

---

## 現在の依存関係の状態

```json
{
  "dependencies": {
    "expo": "~54.0.32",
    "react-native": "0.81.5",
    "react-native-reanimated": "~3.16.1",
    "nativewind": "^4.2.1",
    "expo-router": "~6.0.22",
    "react-native-screens": "~4.16.0",
    "lucide-react-native": "^0.562.0"
  }
}
```

**制約条件（誤った前提を含む）**:
1. nativewind 4.2.1は**デザイン全体に使用**（変更不可）✅
2. ❌ **誤り**: nativewind 4はreanimated 4未サポート → reanimated 3が必須
   - ✅ **正解**: NativeWind v4.2.0+はReanimated v4対応済み
3. reanimated 3 + RN 0.81でFollyビルドエラー（実際に発生）
4. ❌ **誤り**: New Arch有効化でreanimated 4使用可能だが、TestFlightでクラッシュ
   - ✅ **正解**: New Arch ON + Reanimated 4でTestFlight正常動作

---

## ~~検討中の解決策~~（実際の解決策で不要になった）

以下の選択肢を検討していましたが、**誤った前提**（nativewind 4がreanimated 4未サポート）を訂正することで、すべて不要になりました。

### ~~オプション1: Reanimated 3.14.0を試す~~
- **不要になった理由**: Reanimated 4が正解だった

### ~~オプション2: New Architectureを有効化してクラッシュ原因を特定~~
- **これが正解**: New Arch ONで正常動作した

### ~~オプション3: nativewind v2にダウングレード~~
- **不要になった理由**: nativewind 4.2.1がReanimated 4対応済みだった

### ~~オプション4: Expo SDK 53にダウングレード~~
- **不要になった理由**: SDK 54の推奨構成で動作した

---

## 技術的背景情報

### React Native New Architecture とは
React Native 0.68+で導入された新しいレンダリングエンジン:
- **Fabric**: 新しいUIレイヤー
- **TurboModules**: ネイティブモジュールの高速化
- Expo SDK 54で実験的サポート
- **SDK 55以降はNew Architecture必須**（Legacy Architecture廃止予定）

### Follyライブラリ
- Facebookが開発したC++ユーティリティライブラリ
- React Nativeのコア依存関係
- RN 0.80/0.81でバージョンアップ時に`folly/coro/Coroutine.h`パスの問題発生

### React Native Reanimated
- React Nativeのアニメーションライブラリ
- UIスレッドで高性能アニメーション実行
- **Version 3**: Legacy Architecture対応
- **Version 4**: New Architecture専用、react-native-worklets分離

### NativeWind
- React NativeでTailwind CSSを使用するライブラリ
- ~~v4はReanimated 4未サポート（2026年1月時点）~~ ← **誤り**
- ✅ **正解**: v4.2.0+はReanimated v4対応済み

---

## 関連リソース

### 公式ドキュメント
- [Expo SDK 54 - Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/)
- [React Native New Architecture Guide](https://reactnative.dev/docs/new-architecture-intro)
- [Reanimated 3.x Troubleshooting](https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting/)

### 関連Issue
- [React Native #53575 - folly/coro/Coroutine.h not found](https://github.com/facebook/react-native/issues/53575)
- [Expo #39130 - SDK 54 + nativewind + reanimated 3 migration](https://github.com/expo/expo/discussions/39130)
- [Folly #2297 - Coroutine.h missing in RN 0.74+](https://github.com/facebook/folly/issues/2297)

### 参考記事
- [Upgrading to Expo 54 and React Native 0.81: A Developer's Survival Story](https://medium.com/@shanavascruise/upgrading-to-expo-54-and-react-native-0-81-a-developers-survival-story-2f58abf0e326)

---

## 現在の設定ファイル（解決後の正しい構成）

### app.json（重要部分）
```json
{
  "expo": {
    "name": "馬券収支管理",
    "slug": "baken",
    "scheme": "baken",
    "newArchEnabled": true,  // ← ONに変更
    "ios": {
      "bundleIdentifier": "com.do-deuce-fan.baken",
      "buildNumber": "1"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### eas.json
```json
{
  "build": {
    "production": {
      "autoIncrement": true
      // RCT_NEW_ARCH_ENABLEDは削除（矛盾を排除）
    }
  }
}
```

### package.json（依存関係）
```json
{
  "dependencies": {
    "expo": "~54.0.32",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.1.1",  // ← 4.1.1に更新
    "nativewind": "^4.2.1",
    "expo-router": "~6.0.22",
    "react-native-screens": "~4.16.0",
    "lucide-react-native": "^0.562.0"
  }
  // expo.install.excludeは削除
}
```

### babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
```

### metro.config.js
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

---

## 実施済みの追加対応

以下の防御的プログラミングは既に実装済み:

1. **ErrorBoundary追加** (`components/ErrorBoundary.tsx`)
   - グローバルエラーキャッチ機構
   - ユーザーフレンドリーなエラー表示

2. **edit-record.tsxのエラーハンドリング**
   - AsyncStorageエラーのtry-catch追加
   - 適切なフォールバック処理

これらはクラッシュを防ぐものではなく、エラー発生時の体験改善のため。

---

## ✅ 解決済み - 同様の問題に遭遇した場合

このドキュメントが同じ問題に遭遇した方の役に立つことを願っています。

### 解決のポイント

1. **誤った前提を疑う**
   - ドキュメントやブログ記事の情報が古い可能性
   - NativeWindのようなライブラリは頻繁に更新される
   - 公式リポジトリのリリースノートを確認

2. **矛盾する設定を排除**
   - `app.json`と`eas.json`の設定が矛盾していないか確認
   - `package.json`の`expo.install.exclude`が不要な制約になっていないか確認

3. **SDK推奨構成に従う**
   - `npx expo-doctor`でチェック
   - `npx expo install --fix`で依存関係を整合
   - 手動でバージョンを決め打ちしない

4. **キャッシュクリア**
   - `eas build --clear-cache`でクリーンビルド
   - EASの古い生成物が残っていると問題が起きることがある

---

## ~~質問時に提供すると良い情報~~（解決済み）

同様の問題に遭遇した方がコミュニティで質問する場合に有用な情報:

- このドキュメント（解決までの過程を記録）
- 完全なpackage.json
- 完全なクラッシュログ（App Store Connectから取得）
- `npx expo-doctor`の出力結果
- `app.json`と`eas.json`の設定（矛盾がないか確認）

---

## 連絡先・更新履歴

**作成日**: 2026-01-24
**解決日**: 2026-01-25
**最終更新**: 2026-01-25
**作成者**: Claude Code調査レポート

### 更新履歴
- 2026-01-24: 初版作成（問題調査中）
- 2026-01-25: 解決策追加（New Arch ON + Reanimated 4で解決）
- 誤った前提（nativewind 4がreanimated 4未サポート）を訂正
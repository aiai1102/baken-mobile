# TestFlightクラッシュ問題 - 調査レポート

## 問題の概要

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

## ジレンマ（板挟み状態）

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

**制約条件**:
1. nativewind 4.2.1は**デザイン全体に使用**（変更不可）
2. nativewind 4はreanimated 4未サポート → reanimated 3が必須
3. reanimated 3 + RN 0.81でFollyビルドエラー
4. New Arch有効化でreanimated 4使用可能だが、TestFlightでクラッシュ

---

## 検討中の解決策

### オプション1: Reanimated 3.14.0を試す
- 3.16.1より古いバージョンでFolly互換性が良い可能性
- nativewindのデザインは維持される
- **リスク**: さらに古いバグがある可能性

### オプション2: New Architectureを有効化してクラッシュ原因を特定
1. `newArchEnabled: true`でビルド
2. TestFlightにアップロード
3. App Store Connectからクラッシュログを詳細分析
4. 真の原因を特定して個別に修正
- **リスク**: 時間がかかる、根本解決できない可能性

### オプション3: nativewind v2にダウングレード
- nativewind v2はReanimated不要の可能性
- **リスク**: デザインの一部調整が必要、移行コストが大きい

### オプション4: Expo SDK 53にダウングレード
- SDK 53ならNew Archなしで動作する可能性
- **リスク**: 他の機能への影響、後退

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
- v4はReanimated 4未サポート（2026年1月時点）

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

## 現在の設定ファイル

### app.json（重要部分）
```json
{
  "expo": {
    "name": "Baken",
    "slug": "baken-mobile",
    "scheme": "baken",
    "ios": {
      "bundleIdentifier": "com.do-deuce-fan.baken",
      "buildNumber": "1"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": false
          }
        }
      ]
    ]
  }
}
```

### eas.json
```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "env": {
        "RCT_NEW_ARCH_ENABLED": "0"
      }
    }
  }
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

## 次のステップ（推奨）

1. **Expo/React Nativeコミュニティに相談**
   - Expo Discord
   - React Native Discord
   - Stack Overflow

2. **Reanimated GitHubでIssue検索/作成**
   - 同様の問題を抱えている人がいるか確認
   - Folly + RN 0.81 + Reanimated 3の組み合わせで報告

3. **Expo SDK 53へのダウングレード検討**
   - 一時的な回避策として

4. **代替アニメーションライブラリ検討**
   - Reanimatedなしでnativewindが動作するか確認
   - アニメーション使用箇所の洗い出し

---

## 質問時に提供すると良い情報

- このドキュメントのリンク
- 完全なpackage.json
- 完全なクラッシュログ（App Store Connectから取得）
- `npx expo-doctor`の出力結果

---

## 連絡先・更新履歴

**作成日**: 2026-01-24
**最終更新**: 2026-01-24
**作成者**: Claude Code調査レポート
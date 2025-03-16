// 布局組件 Layout components
import AppHeader from './layout/AppHeader.vue';

// 基礎組件 Base components
import AppButton from './base/AppButton.vue';
import AppCard from './base/AppCard.vue';
import ActivityItem from './base/ActivityItem.vue';
import DataTable from './base/DataTable.vue';
import SectionHeader from './base/SectionHeader.vue';
import StatCard from './base/StatCard.vue';
import StatusBadge from './base/StatusBadge.vue';
import WelcomeCard from './base/WelcomeCard.vue';
import AppInput from './base/AppInput.vue';
import AppDialog from './base/AppDialog.vue';
import AppCheckbox from './base/AppCheckbox.vue';
import CheckboxGroup from './base/CheckboxGroup.vue';
import AppSelect from './base/AppSelect.vue';

// 導出所有組件 Export all components
export {
  // 布局組件 Layout components
  AppHeader,
  
  // 基礎組件 Base components
  AppButton,
  AppCard,
  ActivityItem,
  DataTable,
  SectionHeader,
  StatCard,
  StatusBadge,
  WelcomeCard,
  AppInput,
  AppDialog,
  AppCheckbox,
  CheckboxGroup,
  AppSelect
};

// 默認導出所有組件 Default export all components
export default {
  install(app) {
    // 註冊所有組件 Register all components
    app.component('AppHeader', AppHeader);
    app.component('AppButton', AppButton);
    app.component('AppCard', AppCard);
    app.component('ActivityItem', ActivityItem);
    app.component('DataTable', DataTable);
    app.component('SectionHeader', SectionHeader);
    app.component('StatCard', StatCard);
    app.component('StatusBadge', StatusBadge);
    app.component('WelcomeCard', WelcomeCard);
    app.component('AppInput', AppInput);
    app.component('AppDialog', AppDialog);
    app.component('AppCheckbox', AppCheckbox);
    app.component('CheckboxGroup', CheckboxGroup);
    app.component('AppSelect', AppSelect);
  }
}; 
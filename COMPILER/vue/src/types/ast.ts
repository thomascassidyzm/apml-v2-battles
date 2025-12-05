/**
 * APML Abstract Syntax Tree (AST) Type Definitions
 *
 * Represents the parsed structure of an APML document.
 * Based on APML v2.0.0-alpha.7 specification.
 */

export interface APMLDocument {
  app?: AppDeclaration;
  data: DataModel[];
  interfaces: InterfaceSection[];
  logic: LogicSection[];
  computed: ComputedValue[];
  state_machines: StateMachine[];
  realtime: RealtimeConnection[];
  external: ExternalIntegration[];
  integrations?: IntegrationsSection;
  deploy?: DeployConfig;
}

// ============================================================================
// Application Declaration
// ============================================================================

export interface AppDeclaration {
  name: string;
  title?: string;
  description?: string;
  version?: string;
  apml_version?: string;
}

// ============================================================================
// Data Models
// ============================================================================

export interface DataModel {
  name: string;
  fields: Field[];
  relationships?: Relationship[];
}

export interface Field {
  name: string;
  type: FieldType;
  modifiers: FieldModifier[];
  defaultValue?: string;
}

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'timestamp'
  | 'email'
  | 'url'
  | 'unique_id'
  | 'money'
  | 'percentage'
  | { list: FieldType }
  | { model: string };

export type FieldModifier =
  | 'required'
  | 'optional'
  | 'unique'
  | 'auto'
  | { default: string };

export interface Relationship {
  type: 'belongs_to' | 'has_many' | 'has_one';
  model: string;
}

// ============================================================================
// Interface Sections (UI)
// ============================================================================

export interface InterfaceSection {
  name: string;
  elements: UIElement[];
}

export type UIElement =
  | ShowElement
  | DisplayElement
  | ConditionalElement
  | IterationElement;

export interface ShowElement {
  type: 'show';
  elementName: string;
  properties: Record<string, string | Expression>;
  children?: UIElement[];
}

export interface DisplayElement {
  type: 'display';
  elementName: string;
  properties: Record<string, string | Expression>;
}

export interface ConditionalElement {
  type: 'if' | 'when';
  condition: Expression;
  then: UIElement[];
  else?: UIElement[];
}

export interface IterationElement {
  type: 'for_each';
  itemName: string;
  collection: Expression;
  body: UIElement[];
}

// ============================================================================
// Computed Values
// ============================================================================

export interface ComputedValue {
  name: string;
  expression?: Expression;
  value?: Expression;
  format?: 'percentage' | 'currency' | 'number' | 'date' | 'timestamp' | 'duration';
  cache?: boolean;
}

// ============================================================================
// Logic Sections
// ============================================================================

export interface LogicSection {
  name: string;
  processes: Process[];
  calculations?: Calculation[];
  validations?: Validation[];
}

export interface Process {
  name: string;
  trigger: Trigger;
  actions: Action[];
  optimistic?: OptimisticBlock;
}

export interface Trigger {
  type: 'click' | 'submit' | 'input' | 'change' | 'load' | 'timer' | 'custom';
  target?: string;
  condition?: Expression;
}

export interface OptimisticBlock {
  actions: Action[];
  serverAction: Action;
  onSuccess?: Action[];
  onError?: Action[];
}

export type Action =
  | CreateAction
  | UpdateAction
  | DeleteAction
  | NavigateAction
  | NotificationAction
  | ApiCallAction
  | SetStateAction;

export interface CreateAction {
  type: 'create';
  model: string;
  data: Record<string, Expression>;
}

export interface UpdateAction {
  type: 'update';
  target: string;
  data: Record<string, Expression>;
}

export interface DeleteAction {
  type: 'delete';
  target: string;
}

export interface NavigateAction {
  type: 'navigate';
  to: string;
}

export interface NotificationAction {
  type: 'notification';
  message: string;
}

export interface ApiCallAction {
  type: 'api_call';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, Expression>;
}

export interface SetStateAction {
  type: 'set_state';
  variable: string;
  value: Expression;
}

export interface Calculation {
  name: string;
  inputs: string[];
  expression: Expression;
}

export interface Validation {
  name: string;
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  condition: Expression;
  error: string;
}

// ============================================================================
// State Machines
// ============================================================================

export interface StateMachine {
  name: string;
  states: string[];
  initial: string;
  transitions: Transition[];
}

export interface Transition {
  from: string;
  to: string;
  when?: Expression;
  action?: Action | Action[];
  cooldown?: string;
}

// ============================================================================
// Real-time Connections
// ============================================================================

export interface RealtimeConnection {
  name: string;
  url: string;
  onConnected?: Action[];
  onDisconnected?: Action[];
  subscriptions: Subscription[];
  heartbeat?: string;
  reconnectPolicy?: ReconnectPolicy;
}

export interface Subscription {
  channel: string;
  filter?: Expression;
  onMessage: MessageHandler;
}

export interface MessageHandler {
  paramName: string;
  actions: Action[];
}

export type ReconnectPolicy =
  | 'exponential_backoff'
  | { exponential_backoff: { max: string } }
  | { fixed_interval: string }
  | 'none';

// ============================================================================
// External Integrations
// ============================================================================

export interface ExternalIntegration {
  name: string;
  type: 'auth_provider' | 'payments' | 'analytics' | 'email' | 'monitoring' | 'storage' | 'other';
  sdk?: string;
  provides?: string[];
  events?: IntegrationEvent[];
  webhooks?: Webhook[];
}

export interface IntegrationEvent {
  eventName: string;
  paramName?: string;
  actions: Action[];
}

export interface Webhook {
  name: string;
  verify: 'stripe_signature' | 'github_signature' | 'hmac_sha256' | 'bearer_token' | 'custom';
  handlers: WebhookHandler[];
}

export interface WebhookHandler {
  event: string;
  actions: Action[];
}

// ============================================================================
// Integrations (API/Database/Auth)
// ============================================================================

export interface IntegrationsSection {
  apis?: ApiIntegration[];
  database?: DatabaseConfig;
  auth?: AuthConfig;
}

export interface ApiIntegration {
  name: string;
  endpoint: string;
  methods: ApiMethod[];
}

export interface ApiMethod {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  returns?: string;
}

export interface DatabaseConfig {
  provider: 'supabase' | 'postgres' | 'mysql';
  tables: string[];
}

export interface AuthConfig {
  provider: 'supabase' | 'auth0' | 'custom';
  methods: string[];
}

// ============================================================================
// Deploy Configuration
// ============================================================================

export interface DeployConfig {
  platform: 'vercel' | 'netlify' | 'railway';
  environments: Record<string, EnvironmentConfig>;
}

export interface EnvironmentConfig {
  url: string;
}

// ============================================================================
// Expressions
// ============================================================================

export type Expression =
  | string
  | number
  | boolean
  | { var: string }
  | { call: string; args: Expression[] }
  | { binary: { left: Expression; op: BinaryOp; right: Expression } }
  | { unary: { op: UnaryOp; operand: Expression } };

export type BinaryOp =
  | '+'
  | '-'
  | '*'
  | '/'
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | '&&'
  | '||';

export type UnaryOp = '!' | '-';

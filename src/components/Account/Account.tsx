import cn from "classnames";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  apiDeleteUser,
  apiFetch,
  apiGetGameSaves,
  apiLogin,
  apiPatchUser,
  apiSignUp,
  GET_USER,
} from "../../api";
import {
  getDailyId,
  storageAction,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { Button } from "../common/Button/Button";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { Modal } from "../common/Modal/Modal";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Account.module.css";

export function Account() {
  const account = useAppSelector((s) => s.storage.account);
  return (
    <div className={styles.main}>{account ? <LoggedIn /> : <SignUpForm />}</div>
  );
}

function SignUpForm() {
  const dispatch = useAppDispatch();
  const [forgotKeyModal, setForgotKeyModal] = useState(false);
  const [accountKey, setAccountKey] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState(0);
  const prevUserId = useAppSelector((s) => s.storage.prevUserId);
  const [prevAccountUsername, setPrevAccountUsername] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (prevUserId) {
      apiFetch(GET_USER, { user_id: prevUserId }).then((x) => {
        if (x.success) {
          setPrevAccountUsername(x.data.user.username);
        }
      });
    }
  }, [prevUserId]);

  const handleAccountKeyInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Format: xxxx-xxxx-xxxx
    let text = "";
    for (const c of e.target.value.toLowerCase()) {
      if (c.match(/[0-9a-z]/g)) {
        if (text.length >= 14) {
          continue;
        }
        if (text.length === 4 || text.length === 9) {
          text += "-";
        }
        text += c;
      }
    }
    setAccountKey(text);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tab === 0) {
      apiLogin(dispatch, { accountKey }).then((res) => {
        if (res) {
          apiGetGameSaves(dispatch, res.userId, getDailyId(Date.now()));
        }
      });
    } else {
      apiSignUp(dispatch, username, email || null).then((res) => {
        if (res) {
          apiGetGameSaves(dispatch, res.userId, getDailyId(Date.now()));
        }
      });
    }
  };

  const handleAltSubmit = () => {
    if (!prevUserId) return;
    apiLogin(dispatch, { userId: prevUserId }).then((res) => {
      if (res) {
        apiGetGameSaves(dispatch, res.userId, getDailyId(Date.now()));
      }
    });
  };

  return (
    <div className={styles.signUp}>
      <p>
        A duotrigordle account allows you to synchronize your daily games and
        statistics across multiple devices.
      </p>
      <form className={styles.box} onSubmit={handleSubmit}>
        <TabButtons
          tabs={["Log in", "Sign up"]}
          idx={tab}
          onTabChange={setTab}
        />
        {tab === 0 ? (
          <>
            {prevAccountUsername && (
              <>
                <p>
                  Another account ({prevAccountUsername}) was previously used to
                  log in to this device.
                </p>
                <Button className={styles.submit} onClick={handleAltSubmit}>
                  Log in as {prevAccountUsername}
                </Button>
                <hr />
              </>
            )}
            <p>
              Link an existing account. You can obtain your account key from
              another device.
            </p>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="log-in-key">
                Account Key
              </label>
              <input
                id="log-in-key"
                className={cn(styles.input, styles.monospace)}
                type="text"
                placeholder="xxxx-xxxx-xxxx"
                value={accountKey}
                onChange={handleAccountKeyInputChange}
                required
              />
              <LinkButton onClick={() => setForgotKeyModal(true)}>
                Forgot your key?
              </LinkButton>
            </div>
          </>
        ) : (
          <>
            <p>
              Create a new account. Your email is used for account recovery
              purposes only.
            </p>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="sign-in-username">
                Username
              </label>
              <input
                id="sign-in-username"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={20}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="sign-in-email">
                Email (optional)
              </label>
              <input
                id="sign-in-email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </>
        )}
        <Button
          className={styles.submit}
          type="submit"
          value={tab === 0 ? "Log in" : "Sign up"}
        />
      </form>
      <Modal
        noAnimate
        shown={forgotKeyModal}
        onClose={() => setForgotKeyModal(false)}
      >
        <div className={styles.forgotKeyModal}>
          <p>
            Forgot your account key? Send an email to{" "}
            <a href="mailto:bryan.chen@duotrigordle.com">
              bryan.chen@duotrigordle.com
            </a>{" "}
            with your recovery account email.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function LoggedIn() {
  const dispatch = useAppDispatch();
  const [showAccountKey, setShowAccountKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const account = useAppSelector((s) => s.storage.account);
  if (!account) {
    return null;
  }

  const handleCopyAccountKeyClick = () => {
    navigator.clipboard.writeText(account.accountKey).then(() => {
      setCopyConfirm(true);
      setTimeout(() => {
        setCopyConfirm(false);
      }, 1000);
    });
  };

  const handleLogout = () => {
    dispatch(
      uiAction.setSnackbar({
        status: "success",
        text: "Successfully logged out",
      })
    );
    dispatch(storageAction.logout());
  };

  return (
    <div className={styles.loggedIn}>
      <p className={styles.big}>Welcome back, {account.username}!</p>
      <p>
        Your{" "}
        <LinkButton
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "stats" },
                timestamp: Date.now(),
              })
            )
          }
        >
          stats
        </LinkButton>{" "}
        will be synchronized across your devices.
      </p>
      <div className={styles.group}>
        <div className={styles.labelRow}>
          <p>Account Key</p>
          {"·"}
          <LinkButton onClick={handleCopyAccountKeyClick}>
            {copyConfirm ? "Copied!" : "Copy"}
          </LinkButton>
          {"·"}
          <LinkButton onClick={() => setShowAccountKey((x) => !x)}>
            {showAccountKey ? "Hide" : "Reveal"}
          </LinkButton>
        </div>
        <input
          id="account-key"
          className={cn(styles.input, styles.monospace)}
          disabled={!showAccountKey}
          readOnly
          value={showAccountKey ? account.accountKey : "xxxx-xxxx-xxxx"}
          onFocus={(e) => e.currentTarget.select()}
        />
      </div>
      <Button className={styles.logOut} onClick={handleLogout}>
        Log out
      </Button>
      <LinkButton
        className={styles.link}
        onClick={() => setShowAdvanced((x) => !x)}
      >
        {showAdvanced ? "Hide advanced options" : "Show advanced options"}
      </LinkButton>
      {showAdvanced && <AdvancedInfo />}
    </div>
  );
}

function AdvancedInfo() {
  const dispatch = useAppDispatch();
  const account = useAppSelector((s) => s.storage.account);
  const [editEnabled, setEditEnabled] = useState(false);
  const [editUsername, setEditUsername] = useState(account?.username ?? "");
  const [editEmail, setEditEmail] = useState(account?.email ?? "");
  const [deleteAccountModalShown, setDeleteAccountModalShown] = useState(false);
  if (!account) {
    return null;
  }

  const handleEditEnabledClick = () => {
    if (editEnabled) {
      setEditEnabled(false);
      setEditUsername(account.username);
      setEditEmail(account.email ?? "");
    } else {
      setEditEnabled(true);
    }
  };
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    apiPatchUser(
      dispatch,
      account.userId,
      editUsername,
      editEmail || null
    ).then((x) => {
      if (x) {
        setEditUsername(x.username);
        setEditEmail(x.email ?? "");
        setEditEnabled(false);
      }
    });
  };
  const handleDeleteAccountClick = () => {
    apiDeleteUser(dispatch, account.userId);
  };

  return (
    <>
      <form className={styles.box} onSubmit={handleEditSubmit}>
        <div className={styles.labelRow}>
          <p className={styles.big}>Account Details</p>
          {"·"}
          <LinkButton onClick={handleEditEnabledClick}>
            {editEnabled ? "Cancel" : "Edit"}
          </LinkButton>
        </div>
        <div className={styles.group}>
          <label className={styles.label} htmlFor="edit-username">
            Username
          </label>
          <input
            id="edit-username"
            className={styles.input}
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            maxLength={20}
            disabled={!editEnabled}
            required
          />
        </div>
        <div className={styles.group}>
          <label className={styles.label} htmlFor="edit-email">
            Email (optional)
          </label>
          <input
            id="edit-email"
            className={styles.input}
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            disabled={!editEnabled}
          />
        </div>
        <Button
          className={styles.submit}
          type="submit"
          value={"Update account details"}
          disabled={!editEnabled}
        />
      </form>
      <form
        className={styles.box}
        onSubmit={(e) => {
          e.preventDefault();
          setDeleteAccountModalShown(true);
        }}
      >
        <p className={styles.big}>Delete Account</p>
        <p>
          Deleting your account will remove all your account data from the
          server. Your stats will still be saved locally on your device.
        </p>
        <Button
          className={cn(styles.submit, styles.danger)}
          type="submit"
          value={"Delete account"}
        />
      </form>
      <Modal shown={deleteAccountModalShown} hideCloseButton noAnimate>
        <div className={styles.deleteAccountModal}>
          <p>
            Are you sure you want to delete your account? This action is
            irreversable.
          </p>
          <div className={styles.row}>
            <Button
              onClick={handleDeleteAccountClick}
              className={styles.danger}
            >
              Delete account
            </Button>
            <Button onClick={() => setDeleteAccountModalShown(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

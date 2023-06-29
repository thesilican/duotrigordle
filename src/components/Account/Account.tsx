import cn from "classnames";
import { FormEvent, useEffect, useState } from "react";
import {
  apiFetch,
  DELETE_USER,
  GET_USER,
  PATCH_USER,
  POST_USER,
} from "../../api";
import {
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
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState(0);
  const prevUserId = useAppSelector((s) => s.storage.prevUserId);
  const [prevAccountUsername, setPrevAccountUsername] = useState<string | null>(
    null
  );

  useEffect(() => {
    apiFetch(GET_USER, { user_id: prevUserId }).then((x) => {
      if (x.success) {
        setPrevAccountUsername(x.data.user.username);
      }
    });
  }, [prevUserId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tab === 0) {
      apiFetch(GET_USER, { user_id: userId }).then((x) => {
        if (x.success) {
          dispatch(
            storageAction.login({
              userId: x.data.user.user_id,
              username: x.data.user.username,
              email: x.data.user.email,
            })
          );
          dispatch(
            uiAction.setSnackbar({
              status: "success",
              text: "Successfully logged in",
            })
          );
        } else {
          dispatch(uiAction.setSnackbar({ status: "error", text: x.message }));
        }
      });
    } else {
      apiFetch(POST_USER, { email: email || null, username }).then((x) => {
        if (x.success) {
          dispatch(
            storageAction.login({
              userId: x.data.user.user_id,
              username: x.data.user.username,
              email: x.data.user.email,
            })
          );
          dispatch(
            uiAction.setSnackbar({
              status: "success",
              text: "Successfully created account",
            })
          );
        } else {
          dispatch(uiAction.setSnackbar({ status: "error", text: x.message }));
        }
      });
    }
  };

  const handleAltSubmit = () => {
    if (!prevUserId) return;
    apiFetch(GET_USER, { user_id: prevUserId }).then((x) => {
      if (x.success) {
        dispatch(
          storageAction.login({
            userId: x.data.user.user_id,
            username: x.data.user.username,
            email: x.data.user.email,
          })
        );
        dispatch(
          uiAction.setSnackbar({
            status: "success",
            text: "Successfully logged in",
          })
        );
      } else {
        dispatch(uiAction.setSnackbar({ status: "error", text: x.message }));
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
                className={styles.input}
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={userId}
                onChange={(e) => setUserId(e.target.value.trim())}
                required
                pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
                onFocus={(e) => e.target.select()}
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
    navigator.clipboard.writeText(account.userId).then(() => {
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
          className={styles.input}
          type="email"
          disabled={!showAccountKey}
          readOnly
          value={
            showAccountKey
              ? account.userId
              : "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          }
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
    apiFetch(PATCH_USER, {
      user_id: account.userId,
      username: editUsername,
      email: editEmail || null,
    }).then((x) => {
      if (x.success) {
        setEditUsername(x.data.user.username);
        setEditEmail(x.data.user.email ?? "");
        dispatch(
          storageAction.updateAccount({
            userId: account.userId,
            email: x.data.user.email,
            username: x.data.user.username,
          })
        );
        setEditEnabled(false);
        dispatch(
          uiAction.setSnackbar({
            status: "success",
            text: "Successfully updated account details",
          })
        );
      } else {
        dispatch(uiAction.setSnackbar({ status: "error", text: x.message }));
      }
    });
  };
  const handleDeleteAccountClick = () => {
    apiFetch(DELETE_USER, {
      user_id: account.userId,
    }).then((x) => {
      if (x.success) {
        dispatch(storageAction.logout());
        dispatch(
          uiAction.setSnackbar({
            status: "success",
            text: "Successfully deleted account",
          })
        );
      } else {
        dispatch(uiAction.setSnackbar({ status: "error", text: x.message }));
      }
    });
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
